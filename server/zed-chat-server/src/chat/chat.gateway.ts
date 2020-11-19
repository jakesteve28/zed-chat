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

const preflightCheck = (req: Request, res: Response) => {
    const headers = {
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Origin": "http://44.242.86.79:5000",
        "Access-Control-Allow-Credentials": "true"
    };
    res.writeHead(200, headers);
    res.end();
}


@WebSocketGateway(3002, { namespace: "zed-chat-rooms", handlePreflightRequest: preflightCheck })
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
                if(message){
                    this.wss.to(msg.room).emit('delivered', { message: message });
                    //console.log("Message delivered and message emitted: " + JSON.stringify(message) )
                }
                else 
                    this.wss.to(msg.room).emit('messageFail', { fail: true })
            }
        } else {
            console.log("Room does not exist for message " + msg.room )
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
    async handleRoomJoin(@ConnectedSocket() client: Socket, @MessageBody() room: string ) {
        try {
            const msg = JSON.parse(room)
            if(msg.room && msg.user){
                const user = await this.userService.findOne(msg.user);
                const convs = user.conversations;
                if(convs.filter(cv => cv.id === msg.room).length < 1) throw "User not invited to conversation";
                if(!user) throw "User does not exist";
                client.join(msg.room);
                this.wss.to(msg.room).emit('joinedRoom', {  room: msg.room  }); 
            }
        } catch(err) {
            const id = client.id;
            this.wss.to(client.id).emit("error", { msg: err})
        }
    }
    
    @UseGuards(ChatGuard)
    @SubscribeMessage('leaveRoom')
    async handleRoomLeave(@ConnectedSocket() client: Socket, @MessageBody() room: string ) {
        try {
            const msg = JSON.parse(room)
            if(msg.room && msg.user){
                const user = await this.userService.findOne(msg.user);
                const convs = user.conversations;
                if(convs.filter(cv => cv.id === msg.room).length < 1) throw "User not invited to conversation";
                if(!user) throw "User does not exist";
                client.leave(msg.room);
                this.wss.to(msg.room).emit('leftRoom', {  room: msg.room  }); 
            }
        } catch(err) {
            const id = client.id;
            this.wss.to(client.id).emit("error", { msg: err})
        }
    }
}
