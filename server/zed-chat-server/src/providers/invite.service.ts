/**
 * 2021 Jacob Stevens
 * Invite Service
 * Responsible for CRUD operations associated with the invite entity
 * When invites are accepted, also responsible for the user/conv associated CRUD operations
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConversationService } from './conversation.service';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { Invite } from '../entities/invite.entity';
import { User } from 'src/entities/user.entity';

@Injectable()
export class InviteService {
    constructor(private userService: UserService,
                private conversationService: ConversationService,
                @InjectRepository(Invite)
                private readonly inviteRepository: Repository<Invite>
        ) {}

    /**
     * Returns an invite by its uuidv4
     * @param inviteId 
     * @returns invite
     */
    async getInvite(inviteId: string): Promise<Invite> {
        return this.inviteRepository.findOne(inviteId);
    }

    /**
     * Returns a list of invites where the recipient ID is the given user uuidv4
     * @param userId 
     * @returns list of invites received
     */
    async getInvitesByUser(userId: string): Promise<Invite[]> {
        return this.inviteRepository.find({where: { recipientId: userId }});
    }

    /**
     * Returns a list of sent invites, where the senderID is the given user uuidv4
     * @param userId 
     * @returns list of invites sent
     */
    async getSentInvitesByUser(userId: string): Promise<Invite[]> {
        return this.inviteRepository.find({where: { senderId: userId }});
    }
    /**
     * Business logic for marking the invite as cancelled in the database. 
     * Cancelled invites are typically ignored by the client.
     * They are included in the user's account fetch at login. 
     * @param inviteId The invite's uuidv4 as a string
     * @returns An array, first element is the invite that's cancelled, second is the sender, third is recipient
     */
    async cancelInvite(inviteId: string): Promise<[Invite, User, User]> {
        try {
            const invite = await this.inviteRepository.findOne(inviteId);
            if(!invite) throw "Cannot cancel invite: invite does not exist";
            invite.cancelled = true;
            this.conversationService.remove(invite.conversationId); 
            const sender = await this.userService.findOne(invite.senderId); 
            if(!sender) throw "Cannot cancel invite: invite's sender does not exist in the database"; 
            const recipient = await this.userService.findOne(invite.recipientId);
            if(!recipient) throw "Cannot cancel invite: invite recipient does not exist"
            invite.recipientId = ""
            const _invite = await this.inviteRepository.save(invite);
            return [_invite, sender, recipient]; 
        } catch(err) {
            console.error("Error: ", err);
            return null;
        }
    }
    /**
     * Deletes an invite and returns true, or null if it can't be deleted, given the invite's uuidv4
     * @param inviteId 
     * @returns true if successful, null if not
     */
    async deleteInvite(inviteId: any) {
        const invite = await this.inviteRepository.findOne(inviteId); 
        if(invite.accepted !== true) {
            console.error(`Error: cannot delete an invite that hasn't been accepted. Decline it first. Invite with ID ${invite.id}`); 
            return null;
        } else {
            this.inviteRepository.delete(inviteId); 
            return true; 
        }
    }

    /**
     * Returns the invites associated with a conversation, mainl emeployed to prevent a conversation from 
     * having a million invites
     * @param _conversationId 
     * @returns a list of invites
     */
    async getConversationInvites(_conversationId: string): Promise<Invite[]> {
        return this.inviteRepository.find({ where: {
            conversationId: _conversationId
        }})
    }

    /**
     * Responsible for the valid creation of a new invite 
     * TODO: plenty of validation occurnig here to determine if the invite is allowed to be sent/created.
     * TODO: Move validation to the controllers/gateways which call this method
     * @param userId the sender's uuidv4
     * @param recipientId the recipients uuidv4
     * @param conversationId the conv's uuidv4
     * @returns a new invite
     */
    async create(userId: string, recipientId: string, conversationId: string): Promise<Invite> {
        const sender = await this.userService.findOne(userId);
        const recipient = await this.userService.findOne(recipientId);
        const conversation = await this.conversationService.findOne(conversationId);
        if(!sender || !recipient) {
            console.error("Cannot create invite, sender or recipient does not exist");
            return null;
        }
        if(conversation.users.filter(user => user.id === recipient.id).length > 0){
            console.error("Cannot create invite, recipient already belongs to conversation");
            return null;
        }
        if(conversation.users.filter(user => user.id === sender.id).length < 1){
            console.error("Cannot create invite, sender does not belong to conversation", conversation.users)
            return null;
        }
        if(sender.friends.filter(friend => friend.id === recipient.id).length < 1){
            console.error("Cannot create invite, sender is not friends with recipient", sender.friends);
            return null;
        }
        const invite = new Invite();
        invite.conversationId = conversation.id;
        invite.recipientId = recipient.id;
        invite.senderId = sender.id
        return this.inviteRepository.save(invite);
    }

    /**
     * Marks the invite accepted and then adds the accepting user to the associated conversation. 
     * Saves the invite, user, and conversation. 
     * @param inviteId uuidv4 of the invite
     * @returns The accepted invite
     */
    async acceptInvite(inviteId: string): Promise<Invite> {
        const invite = await this.inviteRepository.findOne(inviteId);
        const newUser = await this.userService.findOne(invite.recipientId);
        const conversation = await this.conversationService.findOne(invite.conversationId);
        if(!conversation) throw "Cannot accept invite without a valid conversation"
        const users = conversation.users;
        if(users.filter((user) => user.id === newUser.id).length > 0) throw "Cannot accept invite if user is already part of conversation"
        this.conversationService.addUser(conversation.id, newUser.tagName)
        invite.accepted = true;
        return this.inviteRepository.save(invite);
    }
}
