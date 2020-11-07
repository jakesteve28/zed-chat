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
import { ChatGuard } from './chat.auth-guard';
import { Request, Response } from "express"
import { MessageService } from 'src/messages/message.service';
import { Conversation } from 'src/conversations/conversation.entity';
import { User } from 'src/users/user.entity';
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


@WebSocketGateway(42020, { namespace: "invites", handlePreflightRequest: preflightCheck })
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
        client.emit('connect', { connected: true })

    }

    @UseGuards(InviteGuard)
    @SubscribeMessage('disconnect')
    async handleDisconnect(@ConnectedSocket() client: Socket){
        client.emit('disconnect', { connected: false })
    }

    @UseGuards(InviteGuard)
    @SubscribeMessage('sendInvite')
    async handleEvent(@ConnectedSocket() client: Socket, @MessageBody() data: string) {
        const msg = JSON.parse(data);
        const tag = msg.sender
        const user = await this.userService.findByTagName(tag);
        const recipient = await this.userService.findOne(msg.userId)
        const conv = await this.conversationService.findOne(msg.conversationId)
        console.log("Handle invite from: " + tag)
        const invite = await this.inviteService.create(user.id, recipient.id, conv.id)
        console.log(invite)
        if(user){
                this.wss.emit('convInvite', { invite: invite });
        } else {
            return undefined
        }
    }

    @UseGuards(InviteGuard)
    @SubscribeMessage('acceptInvite')
    async handleAcceptInvite(@ConnectedSocket() client: Socket, @MessageBody() data: string){
        const msg = JSON.parse(data);
        const inviteId = msg.inviteId
        const invite = await this.inviteService.acceptInvite(inviteId)
        if(invite){            
            this.wss.emit('accepted', { invite: invite })
        }
        const recipient = await this.userService.findOne(msg.userId)
        const conv = await this.conversationService.findOne(msg.conversationId)
    }
}