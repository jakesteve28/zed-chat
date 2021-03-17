/**
 * 2021 Jacob Stevens
 * ConversationService 
 * Also called chat rooms... or just chats, or convs. Who needs strict naming conventions? 
 * 
 * Contains a ton of API methods for various CRUD operations on conversations.
 * Things like adding a message, user, saving a message(?), all available here 
 */
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
    /**
     * Given the id, fetches the conversation
     * @param id the uuidv4
     * @returns the conversation, with all its messages and associated users 
     */
    async findOne(id: string): Promise<Conversation> {
        const conv = await this.conversationRepository.findOne(id, {relations: ["users", "messages"]});
        if(conv.numberOfMessages < conv.messages.length){
            conv.numberOfMessages = conv.messages.length;
            return this.conversationRepository.save(conv); 
        }
        return conv;
    }
    /**
     * Array of HTTP requests methods
     * @returns All the available HTTP methods exposed by the controller
     */
    options(): any {
        return { availableMethods : ["GET", "POST", "PUT", "DELETE", "OPTIONS"]}
    }

    /**
     * Create a conversation. Needs a name and a creator
     * @param userId the user's ID
     * @param conversationName the conversation's name... Needs to be sanitized at some point
     * @returns the new conversation
     */
    async create(userId: string, conversationName: string): Promise<Conversation> {
        const conversation = new Conversation();
        const user = await this.userService.findByTagName(userId);
        conversation.users = [];
        conversation.users.push(user);
        conversation.conversationName = conversationName;
        return this.conversationRepository.save(conversation);
    }

    /**
     * Marks a conversation as accepted, and no longer pending. 
     * Pending conversations should appear in the client but greyedout/notselectable, or not at all
     * @param convId the uuidv4 of the conv
     * @returns the conv, now marked as accepted
     */
    async markAccepted(convId: string): Promise<Conversation> {
        const conv = await this.conversationRepository.findOne(convId);
        conv.pending = false;
        return this.conversationRepository.save(conv);
    }

    /**
     * Removes a conv from the database
     * @param id the id of the conv
     * @returns a string with the success message
     */
    async remove(id: string): Promise<string> {
        await this.conversationRepository.delete(id);
        return `Conversation removed successfully ID: ${id}`;
    }

    /**
     * Selects the conversation, fetches the user, adds them, saves, returns. No validation here. Just balls to the wall
     * @param conversationId hmm I wonder
     * @param userTagName 
     * @returns the conversation, now associated with user with given tagname
     */
    async addUser(conversationId: string, userTagName: string): Promise<Conversation>{
        const conversation = await this.conversationRepository.findOne(conversationId, { relations: ["users", "messages"] });
        const user = await this.userService.findByTagName(userTagName);
        conversation.users = [...conversation.users, user];
        return this.conversationRepository.save(conversation);
    }

    /**
     * Removes a user from the conversation. Filters them out by their tagname.
     * @param conversationId 
     * @param userTagName 
     * @returns the conversation, now removed of user with given tagname.
     */
    async removeUser(conversationId: string, userTagName: string): Promise<Conversation>{
        const conversation = await this.conversationRepository.findOne({ where: {
            id: conversationId
        }, relations: ["users"]});
        const user = await this.userService.leaveConversation(userTagName, conversationId); 
        if(user){
            conversation.users = conversation.users.filter((element) => {
                return element.tagName != userTagName
            });
        }
        return this.conversationRepository.save(conversation);
    }

    /**
     * Fetches the users of the conversation
     * @param conversationId 
     * @returns An array of users
     */
    async getUsers(conversationId: string): Promise<User[]> {
        const conv = await this.conversationRepository.findOne(conversationId, { relations: ["users"]});
        for(const us of conv.users){
            delete us.password;
            delete us.refreshToken;
        }
        return conv.users;
    }

    /**
     * Returns the first 25 messages of a conversation if the passed user with ID is part of it.
     * @param userId the requesting user... Validation performed here... Probably bad... 
     * @param conversationId 
     * @returns an array of messages in chronological order
     */
    async getMessagesTruncated(userId: string, conversationId: string): Promise<Message[]> {
        const conversation = await this.conversationRepository.findOne({ where: {
            id: conversationId
        }, relations: ["messages"]});
        if(!conversation) {
            return [];
        }
        if(!conversation.users.some(user => user.id === userId)){
            return null;
        }
        if(conversation.messages.length > 1){
            conversation.messages.sort((a, b) =>  Date.parse(b.createdAt) - Date.parse(a.createdAt));
            const retMsgs = cloneDeep(conversation.messages); 
            if(retMsgs.length > 25) {
                return retMsgs.slice(0, 25);
            } else return retMsgs;
        } else return conversation.messages;
    }

    /**
     * Returns all the messages of a conversation
     * @param conversationId 
     * @returns array of messages in chronological order
     */
    async getAllMessages(conversationId: string): Promise<Message[]> {
        const conversation = await this.conversationRepository.findOne({ where: {
            id: conversationId
        }, relations: ["messages"]});
        return conversation.messages;
    }
    /**
     * To be as lazy as possible in order to enable lazy loading, I needed a "length" attribute for the number of messages. 
     * Probably could just select where conv id === blah for length, this method fetches the conv and increments a number of messages attribute which is used
     * by the client for determining if it has all the messages, then will fetch another 25 if it doesn't.
     * @param conversationId 
     * @returns The conversation, with an incremented number of messages attribute.
     */
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