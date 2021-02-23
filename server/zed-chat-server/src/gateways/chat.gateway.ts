import {
    WebSocketGateway,
    SubscribeMessage,
    WebSocketServer,
    MessageBody,
    ConnectedSocket
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { UserService } from '../providers/user.service'
import { ConversationService } from '../providers/conversation.service';
import { UseGuards } from '@nestjs/common';
import { ChatGuard } from '../guards/chat.gateway.auth-guard';
import { Request, Response } from "express"
import { MessageService } from '../providers/message.service';

const preflightCheck = (req: Request, res: Response) => {
    const headers = {
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Origin": "localhost:3000",
        "Access-Control-Allow-Credentials": "true"
    };
    res.writeHead(200, headers);
    res.end();
}
/**
 * Gateway for socket.io running on port 3000 under namespace 'chat'
 */
@WebSocketGateway({ namespace: "chat", handlePreflightRequest: preflightCheck })
export class ChatGateway  {
    constructor(
                private userService: UserService,
                private messageService: MessageService,
                private conversationService: ConversationService
    ){
        console.log(`Establishing chat socket.io gateway event listeners`);
    }
    @WebSocketServer() wss: Server;
    
    /**
     * Event handler for the "connect" method. This handler is responsible for
     * ensuring client is valid, and doesn't already exist elsewhere (2+ logins on same account)
     * @param client 
     * @param data { userId: string }
     */
    @UseGuards(ChatGuard)
    @SubscribeMessage('connect')
    handleConnect(@ConnectedSocket() client: Socket){
            console.log(`New user connected with client socket ID ${client.id}`);
            return;
    }

    /**
     * Handle's refresh event from a logged in user (guard) and set's the user's client socket ID
     * @param client 
     * @param data { userId: (user's ID) }
     */
    @UseGuards(ChatGuard)
    @SubscribeMessage('refresh')
    async handleRefreshChatSocket(@ConnectedSocket() client: Socket, @MessageBody() data) {
        console.log("Handle refresh chat socket ID for user");
        try {
            const { userId } = data;
            const socketId = client.id;
            const user = await this.userService.setChatSocketId(userId, socketId);
            if(!user) {
                throw `Cannot find user with id: ${userId}, error logging in`;
            } else {
                client.emit("refreshSuccess", { clientId: `${client.id}` });
                console.log(`Success: emitted chat "refreshClientSocketSuccess" to User ${user.tagName}`);
            }
            return true;
        } catch(err) {
            const socketId = client.id;
            const errMsg = `Error: "refreshClientSocket" event not sent to client ID: ${socketId} notification socket connected request failed ${err?.message}`;
            console.log(errMsg);
            client.emit('error', { msg: errMsg });
            return false;
        }
    }

    /**
     * Event handler for the "disconnect" method. This handler is responsible for
     * ensuring client is valid, and can disconnect properly.
     * @param client 
     * @param data { userId: string }
     */
    @UseGuards(ChatGuard)
    @SubscribeMessage('disconnect')
    async handleDisconnect(@ConnectedSocket() client: Socket){
        try {
            const socketId = client.id;
            const connectedUser = await this.userService.findByChatSocketId(socketId);
            if(connectedUser) {
                const user = await this.userService.logout(connectedUser.id);
                if(!user) throw `Error: disconnecting chat socket failed with client ID ${socketId}!`;
                client.leaveAll();
                client.disconnect();
            }
        } catch(err) {
            console.log(`Error: "disconnect" event failure | ${err} |`);
            return null;
        }
    }

    /**
     * Handler for chatToServer, sent from the message sender.
     * Creates a message, adds it to the conversation, and emits the 'delivered' event to 
     * the message's chat room. If other users are joined/connected they'll receive it.
     * @param client 
     * @param data { sender: string(tagName), room: string(conversationId), message: string(messageBody) }
     */
    @UseGuards(ChatGuard)
    @SubscribeMessage('chatToServer')
    async handleEvent(@ConnectedSocket() client: Socket, @MessageBody() data) {
        try {
            const { room, sender, body } = data;
            const user = await this.userService.findByTagName(sender);
            const conversation = await this.conversationService.findOne(room);
            if(conversation && user){
                    const message = await this.messageService.create(body, user, conversation);
                    if(message){
                        console.log("Emitting delivered event to all users of conversation with ID " + room);
                        for(const user of conversation.users){
                            if(user.chatSocketId !== "disconnected"){
                                this.wss.to(user.chatSocketId).emit('delivered', { message: message, from: user.tagName }, () => {
                                    console.log(`Delivered event sent to user @${user.tagName}`)
                                });
                            }
                        }
                    }
                    else {
                        const socketId = client.id;
                        console.log(`Error: "delivered" event failed, unsuccessful message creation`);
                        this.wss.to(socketId).emit('error', { delivered: false }); 
                        return null;            
                    }
            } else if (!user) {
                console.log(`Error: Cannot find user with tagname @${sender}`)
                return null;
            } else if (!conversation) {
                console.log(`Error: conversation room doesn't exist with ID ${room}`);
                return null;
            } 
        } catch(err) {
            const socketId = client.id;
            const errMsg = `Error: "chatToServer" event handler failed with error | ${err} | with socket ${socketId}`;
            console.log(errMsg);
            this.wss.to(socketId).emit("error", { msg: errMsg }); 
            return null;
        }
    }

    /**
     * Handles readMessage event, marks message as read 
     * and dispatches the readReceipt event to the sender 
     * if their current chat socket ID isn't disconnected
     * @param client 
     * @param data { id: string(messageId), conversation: Conversation, room: string(conversationId), readBy: string(userId) }
     */
    @UseGuards(ChatGuard)
    @SubscribeMessage('readMessage')
    async handleReadMessage(@ConnectedSocket() client: Socket, @MessageBody() data) {
        try {
            const msg = data;
            const reader = await this.userService.findOne(msg.readBy);
            if(reader){
                if(msg.message.id && msg.message.conversation){
                    console.log("Handle Read Message: " + msg);
                    const message = await this.messageService.setRead(msg.message.id);
                    const conv = await this.conversationService.findOne(msg.message.conversation.id);
                    conv.users.filter(user => user.id !== reader.id).map(val => {
                        if(val.chatSocketId !== 'disconnected'){
                            this.wss.to(val.chatSocketId).emit('readReceipt', { message: message }, () => {
                                console.log(`Success: emitted "readReceipt" event to user @${val.tagName} for message ${msg.id}`)
                            });
                        }
                    });
                }
                else throw "Message does not exist";
            }
            else throw `User with ID: ${msg.readBy} does not exist`;
            return undefined;
        } catch(err) {
            const socketId = client.id;
            console.log(`Error with "readMessage" event | ${err} | with socket ${socketId}`);
            return undefined;
        }
    }

    /**
     * Handles typing event from client, sends typing event to users of conversation
     * @param client 
     * @param data { sender: string(userId), room: string(conversationId), typing: boolean }
     */
    @UseGuards(ChatGuard)
    @SubscribeMessage('typing')
    async handleTyping(@ConnectedSocket() client: Socket, @MessageBody() data) {
        try {
            const msg = data;
            const tag = msg.sender
            const user = await this.userService.findByTagName(tag);
            if(msg.room){
                if(user){
                    const users = await this.conversationService.getUsers(msg.room);
                    for(const _user of users){
                        if(_user.id === user.id) continue; 
                        if(_user.chatSocketId !== 'disconnected'){
                            this.wss.to(_user.chatSocketId).emit('typing', { conv: msg.room, user: user, typing: msg.typing })
                        }
                    }
                    console.log(`Success: emitting typing event ${msg.typing ? "start" : "finish"} from: @${user.tagName}`);
                } else throw `User with ID: ${tag} does not exist`;
            } else {
                throw `Conversation with ID: ${msg.room} does not exist`;
            }
        } catch(err) {
            const socketId = client.id;
            console.log(`Error: "typing" event not sent | ${err} | with socket ${socketId}`);
            return undefined;
        }
    }

    /**
     * Handles event user listens to the room, receiving the events dispatched from it
     * @param client 
     * @param room { room: string(conversationId), user: string(userId) }
     */
    @UseGuards(ChatGuard)
    @SubscribeMessage('listen')
    async handleRoomJoin(@ConnectedSocket() client: Socket, @MessageBody() room: string ) {
        try {
            //Hotfix checks for string or object from client
            let msg;
            if(typeof room === 'string'){
                msg = JSON.parse(room);
            } else if(typeof room === 'object') {
                msg = room;
            }
            const socketId = client.id;
            const user = await this.userService.findOne(msg.user);
            if(user){
                const conv = await this.conversationService.findOne(msg.room);
                if(conv){
                    const convs = user.conversations;
                    if(convs.filter(cv => cv.id === msg.room).length < 1) throw "User not invited to conversation";
                    if(!user) throw "User does not exist";
                    client.join(msg.room);
                    this.wss.to(socketId).emit('listening', {  room: msg.room  }); 
                    console.log(`Success: emitted "listening" event to user @${user.tagName} for conversation ${msg.room}`);
                } else {
                    throw `Error: Conversation with id ${msg.room} does not exist`;
                }
            } else {
                throw `Error: User with id ${msg.user} does not exist`;
            }
        } catch(err) {
            const socketId = client.id;
            console.log(`Error: "listening" event not sent | ${err} | with socket ${socketId}`);
            this.wss.to(socketId).emit("listenError", { msg: err})
            console.log(`Success: emitted "listenError" event to socket ${socketId}`);
        }
    }
    
    /**
     * Handles event user stops listening to the room, 
     * @param client 
     * @param room { user: string(userId), room: string(conversationId) }
     */
    @UseGuards(ChatGuard)
    @SubscribeMessage('unlisten')
    async handleRoomLeave(@ConnectedSocket() client: Socket, @MessageBody() room: string ) {
        try {
            const msg = JSON.parse(room)
            const user = await this.userService.findOne(msg.user);     
            if(user){
                const convs = user.conversations;
                const conv = this.conversationService.findOne(msg.room);
                if(conv){
                    if(convs.filter(cv => cv.id === msg.room).length < 1) throw "User not invited to conversation";
                    if(!user) throw "User does not exist";
                    client.leave(msg.room);
                    this.wss.to(msg.room).emit('unlistened', {  room: msg.room  });   
                } else {
                    throw `Error: Conversation with id ${msg.room} does not exist`;
                }
            } else {
                throw `Error: User with id ${msg.user} does not exist`;
            }   
        } catch(err) {
            const socketId = client.id;
            console.log(`Error: "listeningStopped" event not sent | ${err} | with socket ${socketId}`);
            this.wss.to(socketId).emit("unlistenError", { msg: err })
            console.log(`Success: emitted "listenStopError" event to socket ${socketId}`);
        }
    }

    /**
     * Handles setting current conversation event for users and updates 
     * all the user's friends with their current conversation.
     * @param client 
     * @param data { user: User, conversationId: string(convId) }
     */
    @UseGuards(ChatGuard)
    @SubscribeMessage('setCurrentConversation')
    async handleSetCurrentConversation(@ConnectedSocket() client: Socket, @MessageBody() data ) {
        try {
            const msg = data;
            const socketId = client.id;
            const user = await this.userService.setCurrentConversationId(msg.user.id, msg.conversationId);
            if(user && user.currentConversationId === msg.conversationId){
                const friends = await this.userService.getFriends(user.id);
                friends.map((friend) => {
                    if(friend.chatSocketId !== 'disconnected'){
                        this.wss.to(friend.chatSocketId).emit('currentConversationUpdate', { user: user });
                        console.log(`Success: Emitted "currentConversationUpdate" event to @${friend.tagName}`); 
                    }
                    else console.log(`Warning: Cannot emit "currentConversationUpdate" to @${friend.tagName} because friend is not online`);
                })
                //console.log("Friends all updated. Now setting messages to 'read' in conversation");
                const conversation = await this.conversationService.findOne(user.currentConversationId);
                if(conversation.messages.length > 0) {
                    const msgs = await this.messageService.setAllRead(conversation.id, user.id); 
                    for(const msg of msgs) {
                        if(msg.user.tagName !== user.tagName) {
                            //other users in conversation 
                            if(msg.user.chatSocketId !== 'disconnected'){
                                this.wss.to(msg.user.chatSocketId).emit('readReceipt', { message: msg });
                                console.log(`Emitted read receipt to user ${msg.user.tagName} with socketId ${msg.user.chatSocketId}`)                     
                            }
                        }
                    }
                }
            } else {
                console.log(`Error: Setting current conversation for user failed`);
                this.wss.to(socketId).emit("setCurrentConversationError", { msg: `Error with message's conversation: +  ${msg.conversationId}` });
                console.log(`Success: Emitted "setCurrentConversationError" to client socket ID: ${socketId}`);
            }
        } catch(err) {
            const socketId = client.id;
            console.log(`Error: "currentConversationUpdate" event not sent | ${err} | with socket ${socketId}`);
            this.wss.to(socketId).emit("setCurrentConversationError", { msg: err });
            console.log(`Success: emitted "setCurrentConversationError" event to socket ${socketId}`);
        } 
    }

    @UseGuards(ChatGuard)
    @SubscribeMessage('pinMessage')
    async handlePinMsg(@ConnectedSocket() client: Socket, @MessageBody() data ) {
        try {
            //const socketId = client.id;
            const message = await this.messageService.pinMessage(data.messageId); 
            if(message) {
                const users = message.conversation.users; 
                //const sender = message.user; 
                if(Array.isArray(users)) {
                    for(const user of users) {
                        if(user.chatSocketId !== "disconnected") {
                            this.wss.to(user.chatSocketId).emit("messagePinned", { message: message });
                            console.log("Successfully emitted messagePinned to all chat users"); 
                        }
                    }
                }
            }
        } catch(err) {
            const socketId = client.id;
            console.log(`Error: "messagePinned" event not sent | ${err} | with socket ${socketId}`);
            this.wss.to(socketId).emit("messagePinnedError", { msg: err });
            console.log(`Success: emitted "messagePinnedError" event to socket ${socketId}`);
        } 
    }
}
