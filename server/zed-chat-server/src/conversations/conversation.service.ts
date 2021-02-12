import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { cloneDeep } from 'lodash';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './conversation.entity';
import { UserService } from '../users/user.service';
import { Message } from '../messages/message.entity';
import { User } from '../users/user.entity';

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
    findOne(id: string): Promise<Conversation> {
        return this.conversationRepository.findOne(id, {relations: ["users", "messages"]});
    }
    options(): any {
        return { availableMethods : ["GET", "POST", "PUT", "DELETE", "OPTIONS"]}
    }
    async create(userId: string, conversationName: string): Promise<Conversation> {
        const conversation = new Conversation();
        const user = await this.userService.findByTagName(userId);
        conversation.users = [];
        conversation.users.push(user);
       // const _conversation = await this.conversationRepository.save(conversation);
        //const _user = await this.userService.addConversation(__user.id, conversation.id);
        //if(_user.conversations.filter((conv) => conv.id === _conversation.id).length < 1)
         //   throw `User: ${_user.id} conversations[] unsuccessfully updated`
        //if(_conversation.users.filter((user) => user.id === _user.id).length < 1)
        //    throw `Conversation: ${_conversation.id} users[] unsuccessfully updated`
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
        }
        return conv.users;
    }
    async getMessagesTruncated(conversationId: string): Promise<Message[]> {
        const conversation = await this.conversationRepository.findOne({ where: {
            id: conversationId
        }, relations: ["messages"]});
        if(conversation.messages.length > 1){
            conversation.messages.sort((a, b) =>  Date.parse(a.createdAt) - Date.parse(b.createdAt));
            const retMsgs = cloneDeep(conversation.messages); 
            if(retMsgs.length > 25) {
                retMsgs.slice(0, 25);
                return retMsgs;
            } else return retMsgs;
        } else return conversation.messages;
    }
    async getAllMessages(conversationId: string): Promise<Message[]> {
        const conversation = await this.conversationRepository.findOne({ where: {
            id: conversationId
        }, relations: ["messages"]});
        return conversation.messages;
    }
}