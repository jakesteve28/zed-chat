import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConversationService } from 'src/conversations/conversation.service';
import { UserService } from 'src/users/user.service';
import { Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './message.entity';

@Injectable()
export class MessageService {
    constructor(private conversationService: ConversationService,
        private userService: UserService,
        @InjectRepository(Message)
        private messageRepository: Repository<Message>){
    }

    async create(createMessageDto: CreateMessageDto): Promise<Message> {
        const message = new Message();
        const user = await this.userService.findOne(createMessageDto.userId);
        const conversation = await this.conversationService.findOne(createMessageDto.conversationId);
        message.body = createMessageDto.body;
        message.user = user;
        message.conversation = conversation;
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
}
