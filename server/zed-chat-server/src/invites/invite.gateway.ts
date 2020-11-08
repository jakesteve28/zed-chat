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

const preflightCheck = (req: Request, res: Response) => {
    const headers = {
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Origin": req.headers.origin,
        "Access-Control-Allow-Credentials": "true"
    };
    res.writeHead(200, headers);
    res.end();
}


@WebSocketGateway(42020, { namespace: "invite-server", handlePreflightRequest: preflightCheck })
export class InviteGateway  {
    constructor(
                private userService: UserService,
                private conversationService: ConversationService,
                private inviteService: InviteService
    ){
    }
    @WebSocketServer() wss: Server;

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
                            this.wss.emit('convInvite', { invite: invite, conv: conv });
                            console.log("Emmitted convInvite successfully")
                    } else {
                        return undefined
                    }
                } else {
                    throw `User with tagname ${msg.userId} does not exist`;
                }
            } else {
                throw "Invite incorrect format" + msg
            }
            
        } catch(err) {
            const socketId = client.id;
            this.wss.to(socketId).emit('error', { msg: err })
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
        //const recipient = await this.userService.findOne(msg.userId)
        //const conv = await this.conversationService.findOne(msg.conversationId)
    }
}