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
import { Request, Response } from "express"
import { InviteService } from '../providers/invite.service';
import { NotificationGuard } from '../guards/notification.gateway.auth-guard';
import { FriendRequestService } from '../providers/friendRequest.service';

const preflightCheck = (req: Request, res: Response) => {
    const headers = {
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Origin": "localhost:3000", //process.env.PROD_CLIENT_HOST || "http://localhost:3003",
        "Access-Control-Allow-Credentials": "true"
    };
    res.writeHead(200, headers);
    res.end();
}

/**
 * Gateway for socket.io running on port 3000 under namespace 'notifications'
 */
@WebSocketGateway({ namespace: "notifications", handlePreflightRequest: preflightCheck })
export class NotificationsGateway  {
    constructor(
                private userService: UserService,
                private conversationService: ConversationService,
                private inviteService: InviteService,
                private friendRequestService: FriendRequestService
    ){
        console.log(`Establishing notifications socket.io gateway event listeners`);
    }
    @WebSocketServer() wss: Server;

    /**
     * Handle's connect event from a logged in user (guard) and set's the user's client socket ID
     * @param client 
     * @param data { userId: (user's ID) }
     */
    @UseGuards(NotificationGuard)
    @SubscribeMessage('connect')
    async handleConnect(@ConnectedSocket() client: Socket): Promise<string | boolean> {
        try {
            console.log(`New user connected with client socket ID ${client.id}`);
        } catch(err) {
            const socketId = client.id; 
            const errorMsg = `Error: "connectSuccess" event not sent to client ID: ${socketId} notification socket connected request failed`;
            this.wss.to(socketId).emit('error', { msg:  errorMsg });
            console.error(errorMsg, err?.message);
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
    async handleRefreshNotificationSocket(@ConnectedSocket() client: Socket, @MessageBody() data): Promise<string | boolean> {
        try {
            const { userId } = data;
            const socketId = client.id;
            const user = await this.userService.setNotificationSocketId(userId, socketId);
            if(!user) {
                throw `Cannot find user with id: ${userId}, error logging in`;
            } else {
                this.wss.to(socketId).emit("refreshNotificationSuccess", { clientId: `${client.id}` });
                console.log(`Success: emitted notification socket "refreshClientSocketSuccess" to User @${user.tagName}`);
            }
        } catch(err) {
            const socketId = client.id;
            const errorMsg = `Error: "refreshClientSocket" event not sent to client ID: ${socketId} notification socket connected request failed`;
            this.wss.to(socketId).emit('error', { msg: errorMsg });
            console.error(errorMsg, err?.message); 
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
    async handleDisconnect(@ConnectedSocket() client: Socket): Promise<string | boolean> {
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
            const errorMsg = `Error: "disconnected" event not sent | ${err} | with socket ${socketId}`
            this.wss.to(socketId).emit('error', { msg: errorMsg });
            console.error(errorMsg, err?.message);
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
            const { sender, tagName, conversationName } = data;
            //Create conversation with sender, set pending to true
            //Pending convs dont show or are  greyed out
            if(sender && tagName){
                if(sender?.tagName === tagName) throw "User cannot send invite to self"
                const recipient = await this.userService.findByTagName(tagName);
                if(recipient) {
                    const user = await this.userService.findByTagName(sender.tagName);
                    delete user.password;
                    const conv = await this.conversationService.create(user.tagName, conversationName);
                    console.log(`Handle invite from: ${sender.tagName} for conversation ${conv.id}`);
                    const invite = await this.inviteService.create(user.id, recipient.id, conv.id)
                    if(recipient?.notificationSocketId !== 'disconnected'){
                        if(user && invite){
                            this.wss.to(recipient.notificationSocketId).emit('inviteReceived', { invite: invite, conv: conv, user: user });
                            this.wss.to(socketId).emit("inviteSent", { invite: invite, conv: conv });
                            console.log(`Conversation invite sent successfully from ${user.tagName} to ${recipient.tagName}`);
                        } else throw `User with tagname ${tagName} does not exist` 
                    } else throw `Recipient ${recipient.tagName} for invite ${invite.id} has connected no socket client; will receive invite on next login!`;  
                } else return false;
            } else throw `Invite incorrect format ${data}`;
        } catch(err) {
            const socketId = client.id;
            const errorMsg = `Error: "inviteSent" event not sent | ${err} | with socket ${socketId}`; 
            console.error(errorMsg, err?.message);
            this.wss.to(socketId).emit('error', { msg: errorMsg });
            return false;
        }
    }
    
    /**
     * Responsible for marking an invite as declined and dispatching the declined invite to the sender and recipient
     * @param client 
     * @param data { inviteId: string }
     */
    @UseGuards(NotificationGuard)
    @SubscribeMessage('declineInvite')
    async handleDeclineInvite(@ConnectedSocket() client: Socket, @MessageBody() data) {
        try {
            const socketId = client.id; 
            const { inviteId } = data;
            const [invite, sender, recipient] = await this.inviteService.cancelInvite(inviteId); 
            console.log("Successfully marked invite as cancelled with ID", inviteId); 
            if(invite.cancelled) {
                if(sender.notificationSocketId === socketId) {
                    if(recipient.notificationSocketId !== 'disconnected') {
                        console.log("Emitting inviteDeclined event to invite recipient user @" + recipient.tagName); 
                        this.wss.to(recipient.notificationSocketId).emit('inviteDeclined', { inviteId: inviteId }); 
                    } 
                    console.log("Emitting inviteDeclined event to invite sender user @" + sender.tagName); 
                    this.wss.to(socketId).emit('inviteDeclined', { inviteId: inviteId });
                } else if(recipient.notificationSocketId === socketId) {
                    if(sender.notificationSocketId !== 'disconnected') {
                        console.log("Emitting inviteDeclined event to invite sender user @" + sender.tagName); 
                        this.wss.to(sender.notificationSocketId).emit('inviteDeclined', { inviteId: inviteId }); 
                    }
                    console.log("Emitting inviteDeclined event to invite recipient user @" + recipient.tagName); 
                    this.wss.to(socketId).emit('inviteDeclined', { inviteId: inviteId });
                }
            }
        } catch(err) {
            console.error("Error: Cannot mark invite as declined. ", err);
            return null;
        }
    }

    /**
     * Responsible for deleting an invite and letting the client know it's been deleted
     * @param client 
     * @param data { inviteId: string }
     */
     @UseGuards(NotificationGuard)
     @SubscribeMessage('deleteInvite')
     async handleDeleteInvite(@ConnectedSocket() client: Socket, @MessageBody() data) {
         try {
             const socketId = client.id; 
             const { inviteId } = data;
             if(await this.inviteService.deleteInvite(inviteId) === true) {
                console.log("Successfully marked invite as cancelled with ID", inviteId); 
                this.wss.to(socketId).emit('inviteDeleted', { inviteId: inviteId }); 
                return true;
             } else { 
                 console.error("Error while deleting invite");
                 return null;
             }
         } catch(err) {
             console.error("Error: Cannot mark invite as declined. ", err);
             return null;
         }
     }

    @UseGuards(NotificationGuard)
    @SubscribeMessage('deleteConversation')
    async handleDeleteConversation(@ConnectedSocket() client: Socket, @MessageBody() data) {
        const { conversationId } = data; 
        console.log("Deleting conversation with ID " + conversationId); 
        try {
            const truth = await this.conversationService.remove(conversationId); 
            return truth; 
        } catch(err) {
            console.error(`Error while deleting conversation with id ${conversationId} | ${err}`);
            return false;
        }
    }
    /**
     * This function handles the accept invite event emitted from a client, partiDElarly the recipient of an
     * invite request who sends this notification to let his their friend know that they're accepted
     * @param client 
     * @param data { inviteId: string, conversationId: string }
     */
    @UseGuards(NotificationGuard)
    @SubscribeMessage('acceptInvite')
    async handleAcceptInvite(@ConnectedSocket() client: Socket, @MessageBody() data): Promise<string | boolean> {
        try {
            const { inviteId, conversationId } = data;
            const invite = await this.inviteService.acceptInvite(inviteId);
            let conv = await this.conversationService.findOne(conversationId);
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
            const errorMsg = `Error: "accepted" event not sent | ${err} | with socket ${socketId}`;
            console.error(errorMsg, err?.message);
            this.wss.to(socketId).emit('error', { msg: errorMsg });
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
            const { senderId, recipientId } = data;
            const socketId = client.id;
            if(senderId === recipientId) throw "Cannot send friend requests to self";
            const exists = await this.userService.getFriendRequests(senderId);
            if(exists && exists.length > 0){
                if(exists.some(frReq => frReq.recipientId === recipientId)){
                    throw "Cannot send more than one friend request to this user";
                }
            }
            const sender = await this.userService.findOne(msg.senderId);
            const recipient = await this.userService.findByTagName(msg.recipientId);
            if(!sender) throw "Sender does not exist"; 
            if(!recipient) throw "Recipient does not exist";
            const friendRequest = await this.friendRequestService.create(sender, recipient);
            if(friendRequest) {  
                if(recipient.notificationSocketId !== 'disconnected'){
                    this.wss.to(recipient.notificationSocketId).emit('friendRequestSent', { friendRequest: friendRequest }); 
                    console.log(`Emmitted friend request sent to @${recipient.tagName} successfully`);
                }                      
                this.wss.to(socketId).emit('friendRequestSent', { friendRequest: friendRequest });                       
                console.log(`Emmitted friend request sent to @${sender.tagName} successfully`);
                return `Emmitted friend request to @${recipient.tagName} successfully`;
            }
            throw "Cannot send friend request server error";
        } catch(err) {
            const socketId = client.id;
            const errorMsg = `Error: "friendRequestSent" event not sent | ${err} | with socket ${socketId}`;
            console.error(errorMsg, err?.message);
            this.wss.to(socketId).emit('error', { msg: errorMsg });
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
    async handleDeclineFriendRequest(@ConnectedSocket() client: Socket, @MessageBody() data): Promise<string | boolean>{
        try {
            const socketId = client.id;
            const { friendRequestId } = data;
            const friendRequest = await this.friendRequestService.declineFriendRequest(friendRequestId);
            const sender = await this.userService.findOne(friendRequest.senderId);
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
            const errorMsg = `Error: "friendRequestDeclined" event not sent | ${err} | with socket ${socketId}`;
            console.error(errorMsg, err?.message)
            this.wss.to(socketId).emit('error', { msg: errorMsg });
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
            const { friendRequestId } = data;
            const socketId = client.id;
            const friendRequest = await this.friendRequestService.acceptFriendRequest(friendRequestId);
            const acceptorProfile = await this.userService.findOne(friendRequest.recipientId);
            const sender = await this.userService.findOne(friendRequest.senderId);
            if(friendRequest){   
                if(sender.notificationSocketId !== 'disconnected'){
                    this.wss.to(sender.notificationSocketId).emit('friendAdded', { friendRequest: friendRequest, acceptor: acceptorProfile, sender: sender });
                    console.log("Emitted friend added event to friend request ID | " + friendRequest.recipientId + " | sender successfully");
                }         
                this.wss.to(socketId).emit('friendAdded', { friendRequest: friendRequest, acceptor: acceptorProfile, sender: sender} );
                console.log("Emitted friend added event to friend request ID | " + friendRequest.recipientId + " | recipient successfully");
            }
        } catch(err) {
            const socketId = client.id;
            const errorMsg = `Error: "friendAdded" event not sent | ${err} | with socket ${socketId}`;
            console.error(errorMsg, err?.message);
            this.wss.to(socketId).emit('error', { msg: errorMsg });
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
    async handleRemoveFriendRequest(@ConnectedSocket() client: Socket, @MessageBody() data): Promise<string | boolean> {
        try {
            const { senderId, tagName } = data;
            const [user, exFriend] = await this.userService.removeFriends(senderId, tagName);
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
            const errorMsg = `Error: "friendRemoved" event not sent | ${err} | with socket ${socketId}`;
            console.error(errorMsg, err?.message);
            this.wss.to(socketId).emit('error', { msg: errorMsg });
            return false;
        }
    }
}
