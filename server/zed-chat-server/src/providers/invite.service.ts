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

    async getInvite(inviteId: string): Promise<Invite> {
        return this.inviteRepository.findOne(inviteId);
    }
    async getInvitesByUser(userId: string): Promise<Invite[]> {
        return this.inviteRepository.find({where: { recipientId: userId }});
    }
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
            this.conversationService.cancel(invite.conversationId); 
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
    async getConversationInvites(_conversationId: string): Promise<Invite[]> {
        return this.inviteRepository.find({ where: {
            conversationId: _conversationId
        }})
    }
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
