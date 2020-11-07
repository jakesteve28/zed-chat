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
        console.log(user, conversation)
        const __user = await this.userService.findByTagName(user)
        console.log(await this.conversationRepository.count({ where: {
            conversationName: `Conversation with @${__user.tagName}`}
        }))
        if(await this.conversationRepository.count({ where: {
            conversationName: `Conversation with @${__user.tagName}`}
        }) > 1){
            throw `Conversation with @${__user.tagName} already exists`
        }
        conversation.conversationName = `Conversation with @${__user.tagName}`
        conversation.users = [] 
        conversation.users.push(__user)
        const _conversation = await this.conversationRepository.save(conversation);
        const _user = await this.userService.addConversation(__user.id, conversation.id);
        if(_user.conversations.filter((conv) => conv.id === _conversation.id).length < 1)
            throw `User: ${_user.id} conversations[] unsuccessfully updated`
        if(_conversation.users.filter((user) => user.id === _user.id).length < 1)
            throw `Conversation: ${_conversation.id} users[] unsuccessfully updated`
        return this.conversationRepository.save(conversation);
    }
    async remove(id: string): Promise<string> {
        await this.conversationRepository.delete(id);
        return `Conversation removed successfully ID: ${id}`
    }
    async addUser(conversationId: string, userTagName: string): Promise<Conversation>{
        const conversation = await this.conversationRepository.findOne(conversationId, { relations: ["users", "messages"] });
        const user = await this.userService.findByTagName(userTagName);
        conversation.users = [...conversation.users, user];
        conversation.conversationName = `@${userTagName}`
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