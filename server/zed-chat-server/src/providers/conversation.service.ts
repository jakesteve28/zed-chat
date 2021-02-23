import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { cloneDeep } from 'lodash';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../entities/conversation.entity';
import { UserService } from './user.service';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class ConversationService {
    constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService
    ) {
        
    }
    findAll(): Promise<Conversation[]> {
        return this.conversationRepository.find();
    }
    async findOne(id: string): Promise<Conversation> {
        const conv = await this.conversationRepository.findOne(id, {relations: ["users", "messages"]});
        if(conv.numberOfMessages < conv.messages.length){
            conv.numberOfMessages = conv.messages.length;
            return this.conversationRepository.save(conv); 
        }
        return conv;
    }
    options(): any {
        return { availableMethods : ["GET", "POST", "PUT", "DELETE", "OPTIONS"]}
    }
    async create(userId: string, conversationName: string): Promise<Conversation> {
        const conversation = new Conversation();
        const user = await this.userService.findByTagName(userId);
        conversation.users = [];
        conversation.users.push(user);
        conversation.conversationName = conversationName;
        return this.conversationRepository.save(conversation);
    }
    async markAccepted(convId: string): Promise<Conversation> {
        const conv = await this.conversationRepository.findOne(convId);
        conv.pending = false;
        return this.conversationRepository.save(conv);
    }
    async remove(id: string): Promise<string> {
        await this.conversationRepository.delete(id);
        return `Conversation removed successfully ID: ${id}`
    }
    async addUser(conversationId: string, userTagName: string): Promise<Conversation>{
        const conversation = await this.conversationRepository.findOne(conversationId, { relations: ["users", "messages"] });
        const user = await this.userService.findByTagName(userTagName);
        conversation.users = [...conversation.users, user];
        let str = ``
        for(let user of conversation.users) str += `@${user.tagName} `
        conversation.conversationName = `Chat with ${str}`
        return this.conversationRepository.save(conversation);
    }
    async removeUser(conversationId: string, userTagName: string): Promise<Conversation>{
        const conversation = await this.conversationRepository.findOne({ where: {
            id: conversationId
        }, relations: ["users"]});
        const user = await this.userService.findByTagName(userTagName);
        conversation.users = conversation.users.filter((element) => {
            return element.tagName != userTagName
        });
        let str = ``
        for(let user of conversation.users) str += `@${user.tagName} `
        conversation.conversationName = `Chat with ${str}`
        return this.conversationRepository.save(conversation);
    }
    async getUsers(conversationId: string): Promise<User[]> {
        const conv = await this.conversationRepository.findOne(conversationId, { relations: ["users"]});
        for(let us of conv.users){
            delete us.password;
            delete us.refreshToken;
        }
        return conv.users;
    }
    async getMessagesTruncated(conversationId: string): Promise<Message[]> {
        const conversation = await this.conversationRepository.findOne({ where: {
            id: conversationId
        }, relations: ["messages"]});
        if(!conversation) {
            return [];
        }
        if(conversation.messages.length > 1){
            conversation.messages.sort((a, b) =>  Date.parse(b.createdAt) - Date.parse(a.createdAt));
            const retMsgs = cloneDeep(conversation.messages); 
            if(retMsgs.length > 25) {
                return retMsgs.slice(0, 25);
            } else return retMsgs;
        } else return conversation.messages;
    }
    async getAllMessages(conversationId: string): Promise<Message[]> {
        const conversation = await this.conversationRepository.findOne({ where: {
            id: conversationId
        }, relations: ["messages"]});
        return conversation.messages;
    }
    //I use number of messages attribute to check if we need to lazy load more messages for this conversation (25 at a time)
    async incrementNumberMessages(conversationId: string): Promise<Conversation> {
        const conversation = await this.conversationRepository.findOne(conversationId, { relations: ['messages']});
        if(conversation.numberOfMessages < conversation.messages.length) {
            conversation.numberOfMessages = conversation.messages.length; 
            return this.conversationRepository.save(conversation); 
        }
        conversation.numberOfMessages++; 
        return this.conversationRepository.save(conversation); 
    }
}