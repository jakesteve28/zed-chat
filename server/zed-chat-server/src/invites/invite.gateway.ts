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
import { InviteService } from 'src/invites/invite.service';
import { InviteGuard } from './invite.auth-guard';
import { FriendRequestGuard } from 'src/friendRequest/friendRequest.auth-guard';
import { FriendRequestService } from 'src/friendRequest/friendRequest.service';
import { emitKeypressEvents } from 'readline';

const preflightCheck = (req: Request, res: Response) => {
    const headers = {
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Credentials": "true"
    };
    res.writeHead(200, headers);
    res.end();
}

@WebSocketGateway(3002, { namespace: "invite-server", handlePreflightRequest: preflightCheck })
export class InviteGateway  {
    constructor(
                private userService: UserService,
                private conversationService: ConversationService,
                private inviteService: InviteService,
                private friendRequestService: FriendRequestService
    ){
    }
    @WebSocketServer() wss: Server;

    @UseGuards(InviteGuard)
    @SubscribeMessage('joinRoom')
    async handleJoin(@ConnectedSocket() client: Socket, @MessageBody() data: string){
        const dt = JSON.parse(data)
        const user = this.userService.findOne(dt.user);
        if(user)
            this.wss.to(dt.room).emit('joinedRoom', user)
    }

    @UseGuards(InviteGuard)
    @SubscribeMessage('leaveRoom')
    async handleLeave(@ConnectedSocket() client: Socket, @MessageBody() data: string){
        
    }

    @UseGuards(InviteGuard)
    @SubscribeMessage('connect')
    async handleConnect(@ConnectedSocket() client: Socket){
        const socketId = client.id
        console.log("Client Connected", client)
        this.wss.to(socketId).emit('connect', { connected: true })
    }

    @UseGuards(InviteGuard)
    @SubscribeMessage('disconnect')
    async handleDisconnect(@ConnectedSocket() client: Socket){
        client.emit('disconnect', { connected: false })
    }

    @UseGuards(InviteGuard)
    @SubscribeMessage('sendInvite')
    async handleEvent(@ConnectedSocket() client: Socket, @MessageBody() data: string) {
        try {
            const socketId = client.id;
            const msg = JSON.parse(data);
            if(msg.sender && msg.userId){
                if(msg.sender.tagName === msg.userId) throw "User cannot send invite to self"
                const recipient = await this.userService.findByTagName(msg.userId)
                if(recipient) {
                    const tag = msg.sender
                    const user = await this.userService.findByTagName(tag.tagName);
                    const conv = await this.conversationService.findOne(msg.conversationId)
                    console.log("Handle invite from: " + JSON.stringify(tag.tagName) + " for conversation " + conv.id)
                    const invite = await this.inviteService.create(user.id, recipient.id, conv.id)
                    console.log(invite)
                    if(user && invite){
                            this.wss.emit('convInvite', { invite: invite, conv: conv, user: user });
                            console.log("Emmitted convInvite successfully")
                    } else {
                        this.wss.to(socketId).emit('error', { msg: `User with tagname ${msg.userId} does not exist` })
                    }
                } else {
                    this.wss.to(socketId).emit('error', { msg: `User with tagname ${msg.userId} does not exist` })
                }
            } else {
                this.wss.to(socketId).emit('error', { msg: "Invite incorrect format" + msg })
            }
            
        } catch(err) {
            const socketId = client.id;
            this.wss.to(socketId).emit('error', { msg: err.message })
        }
    }

    @UseGuards(InviteGuard)
    @SubscribeMessage('acceptInvite')
    async handleAcceptInvite(@ConnectedSocket() client: Socket, @MessageBody() data: string){
        const msg = JSON.parse(data);
        const inviteId = msg.inviteId
        const invite = await this.inviteService.acceptInvite(inviteId)
        const conv = await this.conversationService.findOne(msg.conversationId)
        if(invite){            
            this.wss.emit('accepted', { invite: invite, conv: conv })
            console.log("Emmitted accept invite successfully")
        }
    }

    @UseGuards(FriendRequestGuard)
    @SubscribeMessage("sendFriendRequest")
    async handleSendFriendRequest(@ConnectedSocket() client: Socket, @MessageBody() data: string){
        const msg = JSON.parse(data);
        let errmsg = ''
        try {
            if(msg.senderId === msg.recipientId) throw "Cannot send friend requests to self"
            const exists = await this.userService.getFriendRequests(msg.senderId);
            if(exists && exists.length > 0){
                if(exists.filter(el => el.recipientId === msg.recipientId).length > 0){
                    throw "Cannot send more than one friend request to this user"
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
            const friendRequest = await this.friendRequestService.create(sender.id, recipient.id)
            if(friendRequest){            
                this.wss.emit('friendRequestSent', { friendRequest: friendRequest })
                console.log("Emmitted friend request successfully")
                return true
            }
            throw "Cannot send friend request server error"
        } catch(err) {
            const socketId = client.id
            this.wss.to(socketId).emit('error', { msg: errmsg })
        }
    }
    @UseGuards(FriendRequestGuard)
    @SubscribeMessage("declineFriendRequest")
    async handleDeclineFriendRequest(@ConnectedSocket() client: Socket, @MessageBody() data: string){
        const msg = JSON.parse(data);
        const friendRequest = await this.friendRequestService.declineFriendRequest(msg.friendRequestId)
        if(friendRequest && friendRequest.cancelled === true){            
            this.wss.emit('friendRequestDeclined', { friendRequest: friendRequest })
            console.log("Emmitted friend request declined successfully")
        }
    }

    @UseGuards(FriendRequestGuard)
    @SubscribeMessage("acceptFriendRequest")
    async handleAcceptFriendRequest(@ConnectedSocket() client: Socket, @MessageBody() data: string){
        const msg = JSON.parse(data);
        const friendRequest = await this.friendRequestService.acceptFriendRequest(msg.friendRequestId)
        const acceptorProfile = await this.userService.findOne(friendRequest.recipientId)
        if(friendRequest){            
            this.wss.emit('friendAdded', { friendRequest: friendRequest, acceptor: acceptorProfile} )
            console.log("Emmitted friend added successfully")
            return true
        }
    }

    @UseGuards(FriendRequestGuard)
    @SubscribeMessage("removeFriend")
    async handleRemoveFriendRequest(@ConnectedSocket() client: Socket, @MessageBody() data: string){
        const msg = JSON.parse(data);
        const [user, exFriend] = await this.userService.removeFriends(msg.userId, msg.exFriendId)
        if(user && exFriend && user.friends && exFriend.friends){            
            this.wss.emit('friendRemoved', { exFriend1: user.id, exFriend2: exFriend.id })
            console.log("Emmitted friend removed successfully")
        }
    }
}