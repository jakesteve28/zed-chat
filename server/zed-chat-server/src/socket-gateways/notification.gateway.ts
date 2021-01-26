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
import { Request, Response } from "express"
import { InviteService } from '../invites/invite.service';
import { NotificationGuard } from './auth-guards/notification.auth-guard';
import { FriendRequestService } from '../friendRequest/friendRequest.service';

const preflightCheck = (req: Request, res: Response) => {
    const headers = {
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Origin": "http://localhost:3003", //process.env.PROD_CLIENT_HOST || "http://localhost:3003",
        "Access-Control-Allow-Credentials": "true"
    };
    res.writeHead(200, headers);
    res.end();
}

/**
 * Gateway for socket.io running on port 3002 under namespace 'notifications'
 */
@WebSocketGateway(parseInt(process.env.NOTIFICATION_GATEWAY_PORT) || 3002, { namespace: "notifications", handlePreflightRequest: preflightCheck })
export class NotificationsGateway  {
    constructor(
                private userService: UserService,
                private conversationService: ConversationService,
                private inviteService: InviteService,
                private friendRequestService: FriendRequestService
    ){
        const port = parseInt(process.env.CHAT_GATEWAY_PORT) || 3002;
        console.log(`\tEstablishing notification socket.io gateway on port ${port}`);
    }
    @WebSocketServer() wss: Server;

    /**
     * Handle's connect event from a logged in user (guard) and set's the user's client socket ID
     * @param client 
     * @param data { userId: (user's ID) }
     */
    @UseGuards(NotificationGuard)
    @SubscribeMessage('connect')
    async handleConnect(@ConnectedSocket() client: Socket, @MessageBody() data: string): Promise<string | boolean> {
        try {
            console.log(`New user connected with client socket ID ${client.id}`);
        } catch(err) {
            const socketId = client.id;
            console.log(`Error: "connectSuccess" event not sent to client ID: ${socketId} notification socket connected request failed`);
            this.wss.to(socketId).emit('connectError', { msg:  err });
            console.log(`Success: emmitted "connectError" to client ID ${socketId}`);
            return false;
        }
    }

    /**
     * Handle's refresh event from a logged in user (guard) and set's the user's client socket ID
     * @param client 
     * @param data { userId: (user's ID) }
     */
    @UseGuards(NotificationGuard)
    @SubscribeMessage('refreshNotificationSocket')
    async handleRefreshNotificationSocket(@ConnectedSocket() client: Socket, @MessageBody() data: string): Promise<string | boolean> {
        try {
            const { userId } = JSON.parse(data);
            const socketId = client.id;
            const user = await this.userService.setNotificationSocketId(userId, socketId);
            if(!user) {
                throw `Cannot find user with id: ${userId}, error logging in`;
            } else {
                client.emit("refreshClientSocketSuccess", { clientId: `${client.id}` });
                console.log(`Success: emitted notification socket "refreshClientSocketSuccess" to User @${user.tagName}`);
            }
        } catch(err) {
            const socketId = client.id;
            console.log(`Error: "refreshClientSocket" event not sent to client ID: ${socketId} notification socket connected request failed`);
            client.emit('refreshClientSocketError', { msg:  err });
            console.log(`Success: emitted notification "refreshClientSocketError" to client ID ${socketId}`);
            return false;
        }
    }

    /**
     * Handle's disconnect event from a logged in user (guard) and set's the user's client socket ID to disconnected
     * @param client 
     * @param data { userId: (user's ID) }
     */
    @UseGuards(NotificationGuard)
    @SubscribeMessage('disconnect')
    async handleDisconnect(@ConnectedSocket() client: Socket, @MessageBody() data: string): Promise<string | boolean> {
        try {
            const socketId = client.id;
            const connectedUser = await this.userService.findByNotificationSocketId(socketId);
            if(connectedUser){
                const user = await this.userService.setNotificationSocketId(connectedUser.id, 'disconnected');
                if(!user) throw `Error: disconnecting notification socket failed with client ID ${socketId}!`;
                client.leaveAll();
                client.disconnect();
            }
        } catch(err) {
            const socketId = client.id;
            console.log(`Error: "disconnected" event not sent | ${err} | with socket ${socketId}`);
            this.wss.to(socketId).emit('disconnectError', { msg: err });
            console.log(`Success: emitted "disconnectError" event to socket ${socketId}`);
            return false;
        }
    }

    /**
     * This socket handles invite send and sends chat invite notification to one of a user's friends and confirmation to sender
     * @param client 
     * @param data { sender: <User>, userId: <string>, conversationId: <string> }
     */
    @UseGuards(NotificationGuard)
    @SubscribeMessage('sendInvite')
    async handleEvent(@ConnectedSocket() client: Socket, @MessageBody() data): Promise<string | boolean> {
        try {
            const socketId = client.id;
            const msg = data;
            if(msg.sender && msg.tagName){
                if(msg.sender.tagName === msg.tagName) throw "User cannot send invite to self"
                const recipient = await this.userService.findByTagName(msg.tagName);
                if(recipient) {
                    const tag = msg.sender
                    const user = await this.userService.findByTagName(tag.tagName);
                    user.password = undefined;
                    const conv = await this.conversationService.findOne(msg.conversationId)
                    console.log("Handle invite from: " + JSON.stringify(tag.tagName) + " for conversation " + conv.id)
                    const invite = await this.inviteService.create(user.id, recipient.id, conv.id)
                    if(recipient.notificationSocketId !== 'disconnected'){
                        if(user && invite){
                            this.wss.to(recipient.notificationSocketId).emit('inviteReceived', { invite: invite, conv: conv, user: user });
                            this.wss.to(socketId).emit("inviteSent", { invite: invite, conv: conv });
                            console.log(`Conversation invite sent successfully from ${user.tagName} to ${recipient.tagName}`);
                        } else throw `User with tagname ${msg.tagName} does not exist` 
                    } else throw `Recipient ${recipient.tagName} for invite ${invite.id} has connected no socket client; will receive invite on next login!`;  
                } else throw `User with tagname ${msg.userId} does not exist`;
            } else throw `Invite incorrect format ${msg}`;
        } catch(err) {
            const socketId = client.id;
            console.log(`Error: "inviteSent" event not sent | ${err} | with socket ${socketId}`);
            this.wss.to(socketId).emit('inviteSentError', { msg: err });
            console.log(`Success: emitted "inviteSentError" event to socket ${socketId}`);
            return false;
        }
    }

    /**
     * This function handles the accept invite event emitted from a client, particularly the recipient of an
     * invite request who sends this notification to let his their friend know that they're accepted
     * @param client 
     * @param data { inviteId: string, conversationId: string }
     */
    @UseGuards(NotificationGuard)
    @SubscribeMessage('acceptInvite')
    async handleAcceptInvite(@ConnectedSocket() client: Socket, @MessageBody() data: string): Promise<string | boolean> {
        try {
            const msg = JSON.parse(data);
            const socketId = client.id;
            const inviteId = msg.inviteId;
            const invite = await this.inviteService.acceptInvite(inviteId);
            let conv = await this.conversationService.findOne(msg.conversationId);
            if(conv){
                conv = await this.conversationService.markAccepted(conv.id);
            } else {
                console.log(`Error: cannot find associated conversation for invite with ID | ${inviteId} | `);
                return;
            }
            const sender = await this.userService.findOne(invite.senderId);
            const recipient = await this.userService.findOne(invite.recipientId);
            if(!sender) throw `Error: Sender ID ${invite.senderId} does not exist!`; 
            if(!recipient) throw `Error: Recipient ID ${invite.recipientId} does not exist!`
            if(!invite) throw `Error: Invite creation failure!`;    
            if(sender.notificationSocketId !== 'disconnected') {
                this.wss.to(sender.notificationSocketId).emit('acceptedInvite', { invite: invite, conv: conv });
                console.log(`Success: emitted "acceptedInvite" event successfully to sender: | ${sender.tagName} | recipient: | ${recipient.tagName} |`);
            }
            if(recipient.notificationSocketId !== 'disconnected') {
                this.wss.to(recipient.notificationSocketId).emit('acceptedInvite', { invite: invite, conv: conv });
                console.log(`Success: emitted "acceptedInvite" successfully to recipient: | ${recipient.tagName} | sender: | ${sender.tagName} |`);
            } 
        } catch(err) {
            const socketId = client.id;
            console.log(`Error: "accepted" event not sent | ${err} | with socket ${socketId}`);
            this.wss.to(socketId).emit('acceptInviteError', { msg: err });
            console.log(`Success: emitted "acceptInviteError" event to socket ${socketId}`);
            return false;
        }
    }
    /**
     * Handles the event for sending a friend request from the client. If they're not already friends with the 
     * other user, other user exists, etc.. the request is sent.
     * @param client 
     * @param data { senderId: string, recipientId: string }
     */
    @UseGuards(NotificationGuard)
    @SubscribeMessage("sendFriendRequest")
    async handleSendFriendRequest(@ConnectedSocket() client: Socket, @MessageBody() data): Promise<string | boolean> {
        try {
            const msg = data;
            let errmsg = '';
            const socketId = client.id;
            if(msg.senderId === msg.recipientId) throw "Cannot send friend requests to self";
            const exists = await this.userService.getFriendRequests(msg.senderId);
            if(exists && exists.length > 0){
                if(exists.filter(el => el.recipientId === msg.recipientId).length > 0){
                    throw "Cannot send more than one friend request to this user";
                }
            }
            const sender = await this.userService.findOne(msg.senderId);
            const recipient = await this.userService.findByTagName(msg.recipientId);
            if(!sender){ 
                errmsg = "Sender does not exist";
                throw errmsg;
            }
            if(!recipient){
                errmsg = "Recipient does not exist";
                throw errmsg;
            }
            const friendRequest = await this.friendRequestService.create(sender.id, recipient.id);
            if(friendRequest) {  
                if(recipient.notificationSocketId !== 'disconnected')
                    this.wss.to(recipient.notificationSocketId).emit('friendRequestSent', { friendRequest: friendRequest });                       
                this.wss.to(socketId).emit('friendRequestSent', { friendRequest: friendRequest });                       
                console.log("Emmitted friend request successfully");
            }
            throw "Cannot send friend request server error";
        } catch(err) {
            const socketId = client.id;
            console.log(`Error: "friendRequestSent" event not sent | ${err} | with socket ${socketId}`);
            this.wss.to(socketId).emit('friendRequestSentError', { msg: err });
            console.log(`Success: emitted "friendRequestSentError" event to socket ${socketId}`);
            return false;
        }
    }

    /**
     * Handles the event for declining a received friend request from a client.
     * @param client 
     * @param data { friendRequestId: string }
     */
    @UseGuards(NotificationGuard)
    @SubscribeMessage("declineFriendRequest")
    async handleDeclineFriendRequest(@ConnectedSocket() client: Socket, @MessageBody() data: string): Promise<string | boolean>{
        try {
            const msg = JSON.parse(data);
            const socketId = client.id;
            const friendRequest = await this.friendRequestService.declineFriendRequest(msg.friendRequestId);
            const sender = await this.userService.findOne(friendRequest.sender.id);
            const recipient = await this.userService.findOne(friendRequest.recipientId);
            if(friendRequest && friendRequest.cancelled === true){     
                if(sender.notificationSocketId !== 'disconnected'){
                    this.wss.to(sender.notificationSocketId).emit('friendRequestDeclined', { friendRequest: friendRequest });
                    console.log("Emitted friend request declined event to sender @" + sender.tagName + " successfully");
                }
                this.wss.to(socketId).emit('friendRequestDeclined', { friendRequest: friendRequest });
                console.log(`Emitted friend request declined event successful to decliner @${recipient.tagName}`);
                return 'friendRequestDeclined';
            }
        } catch(err) {
            const socketId = client.id;
            console.log(`Error: "friendRequestDeclined" event not sent | ${err} | with socket ${socketId}`);
            this.wss.to(socketId).emit('friendRequestDeclinedError', { msg: err });
            console.log(`Success: emitted "friendRequestDeclinedError" event to socket ${socketId}`);
            return false;
        } 
    }


    /**
     * Handles the event for accepting received friend request from a client
     * @param client 
     * @param data { friendRequestId: string }
     */
    @UseGuards(NotificationGuard)
    @SubscribeMessage("acceptFriendRequest")
    async handleAcceptFriendRequest(@ConnectedSocket() client: Socket, @MessageBody() data): Promise<string | boolean>{
        try {
            const msg = data;
            const socketId = client.id;
            const friendRequest = await this.friendRequestService.acceptFriendRequest(msg.friendRequestId);
            const acceptorProfile = await this.userService.findOne(friendRequest.recipientId);
            const sender = await this.userService.findByTagName(friendRequest.sender.tagName);
            if(friendRequest){   
                if(sender.notificationSocketId !== 'disconnected'){
                    this.wss.to(sender.notificationSocketId).emit('friendAdded', { friendRequest: friendRequest, acceptor: acceptorProfile });
                    console.log("Emitted friend added event to friend request ID | " + friendRequest.recipientId + " | sender successfully");
                }         
                this.wss.to(socketId).emit('friendAdded', { friendRequest: friendRequest, acceptor: acceptorProfile} );
                console.log("Emitted friend added event to friend request ID | " + friendRequest.recipientId + " | recipient successfully");
            }
        } catch(err) {
            const socketId = client.id;
            console.log(`Error: "friendAdded" event not sent | ${err} | with socket ${socketId}`);
            this.wss.to(socketId).emit('acceptFriendRequestError', { msg: err });
            console.log(`Success: emitted "acceptFriendRequestError" event to socket ${socketId}`);
            return false;
        }
    }

    /**
     * Handles the event for removing a friend from a client's list. Removes everything (Convs, etc.)
     * @param client 
     * @param data { userId: string, exFriendId: string }
     */
    @UseGuards(NotificationGuard)
    @SubscribeMessage("removeFriend")
    async handleRemoveFriendRequest(@ConnectedSocket() client: Socket, @MessageBody() data: string): Promise<string | boolean> {
        try {
            const msg = JSON.parse(data);
            const [user, exFriend] = await this.userService.removeFriends(msg.userId, msg.exFriendId);
            const socketId = client.id;
            if(user && exFriend && user.friends && exFriend.friends){
                if(exFriend.notificationSocketId !== 'disconnected'){
                    this.wss.to(exFriend.notificationSocketId).emit('friendRemoved', { exFriend1: user.id, exFriend2: exFriend.id }); 
                    console.log(`Success: emitted "friendRemoved" event to friend @${exFriend.tagName} from @${user.tagName}`);
                }  
                this.wss.to(socketId).emit('friendRemoved', { exFriend1: user.id, exFriend2: exFriend.id });
                console.log(`Success: emitted "friendRemoved" event to the remover @${user.tagName}`);
            }
        } catch(err) {
            const socketId = client.id;
            console.log(`Error: "friendRemoved" event not sent | ${err} | with socket ${socketId}`);
            this.wss.to(socketId).emit('friendRemovedError', { msg: err });
            console.log(`Success: emitted "friendRemovedError" event to socket ${socketId}`);
            return false;
        }
    }
}
