import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConversationService } from 'src/conversations/conversation.service';
import { UserService } from 'src/users/user.service';
import { Repository } from 'typeorm';
import { Invite } from './invite.entity';

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
    async cancelInvite(inviteId: string): Promise<Invite> {
        const invite = await this.inviteRepository.findOne(inviteId);
        if(!invite) throw "Cannot cancel invite: invite does not exist";
        invite.cancelled = true;
        const recipient = await this.userService.findOne(invite.recipientId);
        if(!recipient) throw "Cannot cancel invite: invite recipient does not exist"
        invite.recipientId = ""
        return this.inviteRepository.save(invite);
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
        if(conversation.users.filter(user => user.id === recipient.id).length > 0)
            console.log("Cannot create invite, recipient already belongs to conversation");
        if(conversation.users.filter(user => user.id === sender.id).length < 1){
            console.log(conversation.users)
            console.log("Cannot create invite, sender does not belong to conversation");
        }
        else {
            const invite = new Invite();
            invite.conversationId = conversation.id;
            invite.recipientId = recipient.id;
            invite.senderId = sender.id
            return this.inviteRepository.save(invite);
        }
    }
    async acceptInvite(inviteId: string): Promise<Invite> {
        const invite = await this.inviteRepository.findOne(inviteId);
        const newUser = await this.userService.findOne(invite.recipientId);
        const conversation = await this.conversationService.findOne(invite.conversationId);
        if(!conversation) throw "Cannot accept invite without a valid conversation"
        const users = conversation.users;
        if(users.filter((user) => user.id === newUser.id).length > 0) throw "Cannot accept invite if user is already part of conversation"
        const _conversation = await this.conversationService.addUser(conversation.id, newUser.tagName)
        invite.accepted = true;
        return this.inviteRepository.save(invite);
    }
}
