import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConversationService } from '../conversations/conversation.service';
import { UserService } from '../users/user.service';
import { Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './message.entity';
import { User } from '../users/user.entity';
import { Conversation } from '../conversations/conversation.entity';

@Injectable()
export class MessageService {
    constructor(private conversationService: ConversationService,
        private userService: UserService,
        @InjectRepository(Message)
        private messageRepository: Repository<Message>){
    }

    async create(createMessageDto: CreateMessageDto, user: User, conversation: Conversation): Promise<Message> {
        const message = new Message();
        message.body = createMessageDto.body || "";
        message.user = user;
        const conv = await this.conversationService.findOne(conversation.id);
        const _conv = await this.conversationService.incrementNumberMessages(conv.id);
        message.conversation = _conv;
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
        for(let msg of messages){
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
