import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConversationService } from 'src/conversations/conversation.service';
import { User } from 'src/users/user.entity';
import { UserService } from 'src/users/user.service';
import { Repository } from 'typeorm';
import { FriendRequest } from './friendRequest.entity';

@Injectable()
export class FriendRequestService {
    constructor(
                @Inject(forwardRef(() => UserService))
                private userService: UserService,
                @InjectRepository(FriendRequest)
                private readonly friendRequestRepository: Repository<FriendRequest>
        ) {}

    async getFriendRequest(id: string): Promise<FriendRequest> {
        return this.friendRequestRepository.findOne(id, { relations: ["sender"] });
    }
    async getFriendRequestsReceivedByUser(userId: string): Promise<FriendRequest[]> {
        return this.friendRequestRepository.find({where: { recipientId: userId }, relations: ["sender"] });
    }
    async getSentFriendRequestsSentByUser(userId: string): Promise<FriendRequest[]> {
        return this.userService.getFriendRequests(userId);
    }
    async create(userId: string, recipientId: string): Promise<FriendRequest> {
        const sender = await this.userService.findOne(userId);
        const recipient = await this.userService.findOne(recipientId);
        if(sender && recipient && recipient.id){
            if(sender.friendRequests.filter(el => el.recipientId === recipient.id ).length > 0){
                throw "Cannot send more than 1 friend request to this user"
            }
            else {
                const friendRequest = new FriendRequest();
                friendRequest.recipientId = recipient.id;
                friendRequest.sender = sender
                const ret = await this.friendRequestRepository.save(friendRequest);
                return this.friendRequestRepository.findOne(ret.id, { relations: ['sender']})
            }
        }
        if(!recipient || !recipient.id) throw "User does not exist"
        if(!sender) throw "Sender does not exist"
    }
    async acceptFriendRequest(id: string): Promise<FriendRequest> {
        const friendRequest =  await this.friendRequestRepository.findOne(id, { relations: ["sender"]}); 
        const newFriend = await this.userService.findOne(friendRequest.recipientId)
        if(friendRequest.sender.id && newFriend.id){
            const [_sender, _newFriend] = await this.userService.addFriends(friendRequest.sender.id, newFriend.id);
            if(_sender && _newFriend && _sender.friends && _newFriend.friends){
                friendRequest.accepted = true 
                const _friendRequest = await this.friendRequestRepository.save(friendRequest)
                if(_friendRequest){
                    console.log(_friendRequest)
                    return _friendRequest
                }
            }
        } else {
            console.log("Cannot accept friend request and add friends")
        }
    }
    async declineFriendRequest(id: string): Promise<FriendRequest> {
        const friendRequest =  await this.friendRequestRepository.findOne(id, { relations: ["sender"]}); 
        const newFriend = await this.userService.findOne(friendRequest.recipientId)
        if(friendRequest.sender.id && newFriend.id){
            friendRequest.cancelled = true
            return this.friendRequestRepository.save(friendRequest); 
        } else {
            console.log("Cannot decline friend request")
        }
    }
}
