import {
    WebSocketGateway,
    SubscribeMessage,
    WebSocketServer,
    MessageBody,
    ConnectedSocket
  } from '@nestjs/websockets';

import { Socket, Server } from 'socket.io';
import { UserService } from '../users/user.service'
import { ConversationService } from '../conversations/conversation.service';
import { UseGuards } from '@nestjs/common';
import { ChatGuard } from './auth-guards/chat.auth-guard';
import { Request, Response } from "express"
import { MessageService } from '../messages/message.service';

// const socketEvents = {
//     sent: {
//         connectSuccess: "connectSuccess",
//         connectError: "connectError",
//         delivered: "delivered",
//         deliveryError: "deliveryError",
//         readReceipt: "readReceipt",
//         typing: "typing",
//         unlistened: "unlistened",
//         unlistenError: "unlistenError",
//         currentConversationUpdate: "currentConversationUpdate",
//         setCurrentConversationError: "setCurrentConversationError",
//     },
//     received: {
//         connect: "connect",
//         disconnect: "disconnect",
//         chatToServer: "chatToServer",
//         readMessage: "readMessage",
//         typing: "typing",
//         listen: "listen",
//         unlisten: "unlisten",
//         setCurrentConversation: "setCurrentConversation",
//     }
// }

const preflightCheck = (req: Request, res: Response) => {
    const headers = {
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Origin": process.env.PROD_CLIENT_HOST || "http://localhost:3003",
        "Access-Control-Allow-Credentials": "true"
    };
    res.writeHead(200, headers);
    res.end();
}
/**
 * Gateway for socket.io running on port 3002 under namespace 'chat'
 */
@WebSocketGateway(parseInt(process.env.CHAT_GATEWAY_PORT) || 3002, { namespace: "chat", handlePreflightRequest: preflightCheck })
export class ChatGateway  {
    constructor(
                private userService: UserService,
                private messageService: MessageService,
                private conversationService: ConversationService
    ){
        const port = parseInt(process.env.CHAT_GATEWAY_PORT) || 3002;
        console.log(`\tEstablishing notification socket.io gateway on port ${port}`);
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
    async handleConnect(@ConnectedSocket() client: Socket, @MessageBody() data: string){
        try {
            console.log(`New user connected with client socket ID ${client.id}`);
        } catch(err) {
            const socketId = client.id;
            console.log(`Error: "connect" event failure | ${err} |`);
            this.wss.to(socketId).emit("connectError", { message: `Error connecting to socket.io server` }, () => {
                console.log(`Success: Emitted "connectError" error event to socket ID: ${socketId}`);
            });
            return undefined;
        }
    }

    /**
     * Handle's refresh event from a logged in user (guard) and set's the user's client socket ID
     * @param client 
     * @param data { userId: (user's ID) }
     */
    @UseGuards(ChatGuard)
    @SubscribeMessage('refreshClientSocket')
    async handleRefreshClientSocket(@ConnectedSocket() client: Socket, @MessageBody() data: string): Promise<string | boolean> {
        try {
            const { userId } = JSON.parse(data);
            const socketId = client.id;
            const user = await this.userService.setChatSocketId(userId, socketId);
            if(!user) {
                throw `Cannot find user with id: ${userId}, error logging in`;
            } else {
                this.wss.to(user.notificationSocketId).emit("refreshClientSocketSuccess", { clientId: `${client.id}` });
                console.log(`Success: emitted "refreshClientSocketSuccess" to User ${user.tagName}`);
            }
        } catch(err) {
            const socketId = client.id;
            console.log(`Error: "refreshClientSocket" event not sent to client ID: ${socketId} notification socket connected request failed`);
            this.wss.to(socketId).emit('refreshClientSocketError', { msg:  err });
            console.log(`Success: emmitted "refreshClientSocketError" to client ID ${socketId}`);
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
    async handleDisconnect(@ConnectedSocket() client: Socket, @MessageBody() data: string){
        try {
            const socketId = client.id;
            const connectedUser = await this.userService.findByChatSocketId(socketId);
            if(connectedUser){
                const user = await this.userService.setChatSocketId(connectedUser.id, 'disconnected');
                if(!user) throw `Error: disconnecting chat socket failed with client ID ${socketId}!`;
                client.leaveAll();
                client.disconnect();
            }
        } catch(err) {
            const socketId = client.id;
            console.log(`Error: "disconnect" event failure | ${err} |`);
            return undefined;
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
    async handleEvent(@ConnectedSocket() client: Socket, @MessageBody() data: string) {
        try {
            const msg = JSON.parse(data);
            const tag = msg.sender
            const user = await this.userService.findByTagName(tag);
            if(msg.room){
                if(user){
                    user.password = undefined; 
                    const message = await this.messageService.create({ body: msg.message, userId: user.id, conversationId: msg.room});
                    if(message){
                        console.log("Emitting delivered event to conversation ID " + msg.room);
                        const conv = await this.conversationService.findOne(msg.room);
                        for(let user of conv.users){
                            if(user.chatSocketId !== "disconnected")
                                this.wss.to(user.chatSocketId).emit('delivered', { message: message, from: user.tagName });
                        }
                    }
                    else {
                        const socketId = client.id;
                        console.log(`Error: "delivered" event failed, unsuccessful message creation`);
                        this.wss.to(socketId).emit('deliveryError', { delivered: false }, () => {
                            console.log(`Success: emitted "deliveryError" event to socket client ID: ${socketId}`);
                        });             
                    }
                } else {
                    throw `Cannot find user with id ${msg.userId}`;
                }
            } else {
                console.log("Error: conversation room does not exist for message " + msg.room )
                return undefined
            }
        } catch(err) {
            const socketId = client.id;
            console.log(`Error: "chatToServer" event handler failed with error | ${err} | with socket ${socketId}`);
            this.wss.to(socketId).emit("deliveryError", { delivered: false }, () => {
                console.log(`Success: emitted "deliveryError" event to message sender socket ${socketId}`);
            });
            return undefined;
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
    async handleReadMessage(@ConnectedSocket() client: Socket, @MessageBody() data: string) {
        try {
            const msg = JSON.parse(data);
            const reader = await this.userService.findOne(msg.readBy);
            if(reader){
                reader.password = undefined; 
                if(msg.id && msg.conversation && msg.room){
                    console.log("Handle Read Message: " + msg);
                    const message = await this.messageService.setRead(msg.id);
                    const conv = await this.conversationService.findOne(msg.conversation.id);
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
    async handleTyping(@ConnectedSocket() client: Socket, @MessageBody() data: string) {
        try {
            const msg = JSON.parse(data);
            const tag = msg.sender
            const user = await this.userService.findByTagName(tag);
            if(msg.room){
                if(user){
                    user.password = undefined; 
                    this.wss.to(msg.room).emit('typing', { conv: msg.room, user: user, typing: msg.typing })
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
            const msg = JSON.parse(room);
            const socketId = client.id;
            const user = await this.userService.findOne(msg.user);
            if(user){
                const conv = await this.conversationService.findOne(msg.room);
                if(conv){
                    const convs = user.conversations;
                    if(convs.filter(cv => cv.id === msg.room).length < 1) throw "User not invited to conversation";
                    if(!user) throw "User does not exist";
                    user.password = undefined;
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
                    const conv = this.conversationService.findOne(msg.room); 
                    if(convs.filter(cv => cv.id === msg.room).length < 1) throw "User not invited to conversation";
                    if(!user) throw "User does not exist";
                    user.password = undefined;
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
    async handleSetCurrentConversation(@ConnectedSocket() client: Socket, @MessageBody() data: string ) {
        try {
            const msg = JSON.parse(data);
            const socketId = client.id;
            const user = await this.userService.setCurrentConversationId(msg.user.id, msg.conversationId);
            if(user && user.currentConversationId === msg.conversationId){
                user.password = undefined;
                user.friends.map((friend) => {
                    if(friend.chatSocketId !== 'disconnected'){
                        this.wss.to(friend.chatSocketId).emit('currentConversationUpdate', { user: user });
                        console.log(`Success: Emitted "currentConversationUpdate" event to @${friend.tagName}`); 
                    }
                    else console.log(`Warning: Cannot emit "currentConversationUpdate" to @${friend.tagName} because friend is not online`);
                })
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
}
