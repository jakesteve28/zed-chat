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

const preflightCheck = (req: Request, res: Response) => {
    const headers = {
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Origin": req.headers.origin,
        "Access-Control-Allow-Credentials": "true"
    };
    res.writeHead(200, headers);
    res.end();
}


@WebSocketGateway(42020, { namespace: "zed-chat-rooms", handlePreflightRequest: preflightCheck })
export class ChatGateway  {
    constructor(
                private userService: UserService,
                private messageService: MessageService,
                private conversationService: ConversationService
    ){
    }
    @WebSocketServer() wss: Server;
    
    @UseGuards(ChatGuard)
    @SubscribeMessage('connect')
    async handleConnect(@ConnectedSocket() client: Socket){
        client.emit('connect', { connected: true })
    }

    @UseGuards(ChatGuard)
    @SubscribeMessage('disconnect')
    async handleDisconnect(@ConnectedSocket() client: Socket){
        client.emit('disconnect', { connected: false })
    }

    @UseGuards(ChatGuard)
    @SubscribeMessage('chatToServer')
    async handleEvent(@ConnectedSocket() client: Socket, @MessageBody() data: string) {
        const msg = JSON.parse(data);
        const tag = msg.sender
        const user = await this.userService.findByTagName(tag);
        console.log("Handle Chat to Server from: " + tag)
        console.log(msg)
        if(msg.room){
            if(user){
                const message = await this.messageService.create({ body: msg.message, userId: user.id, conversationId: msg.room})
                if(message)
                    this.wss.to(msg.room).emit('delivered', { message: message });
                else 
                    this.wss.to(msg.room).emit('messageFail', { fail: true })
            }
        } else {
            return undefined
        }
    }

    @UseGuards(ChatGuard)
    @SubscribeMessage('readMessage')
    async handleReadMessage(@ConnectedSocket() client: Socket, @MessageBody() data: string) {
        const msg = JSON.parse(data);
        if(msg.id && msg.conversation && msg.room){
            console.log("Handle Read Message: " + msg);
            const message = await this.messageService.setRead(msg.id);
            const conv = await this.conversationService.findOne(msg.conversation.id);
            this.wss.to(msg.room).emit('readReceipt', { message: message}) 
        } return undefined
    }

    @UseGuards(ChatGuard)
    @SubscribeMessage('typing')
    async handleTyping(@ConnectedSocket() client: Socket, @MessageBody() data: string) {
        const msg = JSON.parse(data);
        const tag = msg.sender
        const user = await this.userService.findByTagName(tag);
        console.log("Handle typing from: @" + user.tagName)
        console.log(msg)
        if(msg.room){
            if(user){
                this.wss.to(msg.room).emit('typing', { conv: msg.room, user: user, typing: msg.typing })
            }
        } else {
            return undefined
        }
    }

    @UseGuards(ChatGuard)
    @SubscribeMessage('joinRoom')
    handleRoomJoin(@ConnectedSocket() client: Socket, @MessageBody() room: string ) {
        client.join(room);
        this.wss.to(room).emit('joinedRoom', {  room: room  });
    }
    
    @UseGuards(ChatGuard)
    @SubscribeMessage('leaveRoom')
    handleRoomLeave(@ConnectedSocket() client: Socket, @MessageBody() room: string ) {
        client.leave(room);
        this.wss.to(room).emit('leftRoom', {  room: room  });
    }
}