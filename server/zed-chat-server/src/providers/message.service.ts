/**
 * 2021 Jacob Stevens
 * Message service
 * This provider contains methods for common CRUD ops on a message entity 
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConversationService } from './conversation.service';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';
import { Conversation } from '../entities/conversation.entity';

@Injectable()
export class MessageService {
    constructor(private conversationService: ConversationService,
        @InjectRepository(Message)
        private messageRepository: Repository<Message>){
    }

    /**
     * Creates a message given a user, the body, and the conversation/chatroom 
     * Input validation should occur in the controller
     * @param messageBody Body of message. Max 240 chars
     * @param user the sender
     * @param conversation the chatroom 
     * @returns a new message entity
     */
    async create(messageBody: string, user: User, conversation: Conversation): Promise<Message> {
        const message = new Message();
        message.body = messageBody;
        message.user = user;
        message.conversation = await this.conversationService.incrementNumberMessages(conversation.id);
        return this.messageRepository.save(message);
    }

    /**
     * Removes a message by ID
     * @param messageId 
     * @returns true 
     */
    async remove(messageId: string): Promise<boolean> {
        await this.messageRepository.delete(messageId);
        return true;
    }

    /**
     * Marks a message as "seen" or "read" in the database
     * @param messageId 
     * @returns the read message
     */
    async setRead(messageId: string): Promise<Message> {
        const message = await this.messageRepository.findOne(messageId);
        message.read = true;
        return this.messageRepository.save(message);
    }

    /**
     * Sets all the messages in a chatroom as read/seen
     * Useful for when a user opens up a chatroom, marks all of em as seen 
     * @param conversationId 
     * @param userId 
     * @returns an array of messages
     */
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

    /**
     * Saves a message. Chatrooms are only allowed to have 25 messages at a time.
     * Saved ones stay. Max 10 per person per room
     * If both save 10, 20 different colored messages will be in the "saved" section
     * @param messageId 
     * @returns the saved message
     */
    async pinMessage(messageId: string): Promise<Message> {
        const msg = await this.messageRepository.findOne(messageId); 
        if(msg.pinned === false){
            if(msg.conversation){
                const messages = await this.conversationService.getAllMessages(msg.conversation.id);
                if(messages.filter(message => 
                message.pinned === true && message.user.id === msg.user.id )
                .length < 10) {
                    msg.pinned = true; 
                    return this.messageRepository.save(msg); 
                } else {
                    return null;
                }
            }
        } else {
             msg.pinned = false;
             return this.messageRepository.save(msg); 
        }
    }
}
