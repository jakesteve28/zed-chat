import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './conversation.entity';
import { UserService } from '../users/user.service';
import { Message } from 'src/messages/message.entity';
import { User } from 'src/users/user.entity';

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
    async create(user: string): Promise<Conversation> {
        const conversation = new Conversation();
        const __user = await this.userService.findByTagName(user)
        conversation.conversationName = `Empty Conversation`
        conversation.users = [] 
        conversation.users.push(__user)
       // const _conversation = await this.conversationRepository.save(conversation);
        //const _user = await this.userService.addConversation(__user.id, conversation.id);
        //if(_user.conversations.filter((conv) => conv.id === _conversation.id).length < 1)
         //   throw `User: ${_user.id} conversations[] unsuccessfully updated`
        //if(_conversation.users.filter((user) => user.id === _user.id).length < 1)
        //    throw `Conversation: ${_conversation.id} users[] unsuccessfully updated`
        const conv = await this.conversationRepository.save(conversation);
        conv.conversationName = `Chat with @${__user.tagName}`
        return this.conversationRepository.save(conv)
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
        return conv.users;
    }
    async getMessages(conversationId: string): Promise<Message[]> {
        const conversation = await this.conversationRepository.findOne({ where: {
            id: conversationId
        }, relations: ["messages"]});
        return conversation.messages;
    }

}