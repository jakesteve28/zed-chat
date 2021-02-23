import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConversationService } from './conversation.service';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';
import { Conversation } from '../entities/conversation.entity';

@Injectable()
export class MessageService {
    constructor(private conversationService: ConversationService,
        private userService: UserService,
        @InjectRepository(Message)
        private messageRepository: Repository<Message>){
    }
    async create(messageBody: string, user: User, conversation: Conversation): Promise<Message> {
        const message = new Message();
        message.body = messageBody;
        message.user = user;
        message.conversation = await this.conversationService.incrementNumberMessages(conversation.id);
        return this.messageRepository.save(message);
    }
    async remove(messageId: string): Promise<string> {
        await this.messageRepository.delete(messageId);
        return `Message removed successfully ID: ${messageId}`
    }
    async setRead(messageId: string): Promise<Message> {
        const message = await this.messageRepository.findOne(messageId);
        message.read = true;
        return this.messageRepository.save(message);
    }
    async setAllRead(conversationId: string, userId: string):  Promise<Message[]> {
        const messages = await this.conversationService.getAllMessages(conversationId);
        for(const msg of messages){
            if(msg.read !== true && msg.user.id !== userId){
                msg.read = true;
                await this.messageRepository.save(msg);
            }
        }
        return messages;
    }
    async pinMessage(messageId: string): Promise<Message> {
        const msg = await this.messageRepository.findOne(messageId); 
        msg.pinned = !msg.pinned;
        return this.messageRepository.save(msg); 
    }
}
