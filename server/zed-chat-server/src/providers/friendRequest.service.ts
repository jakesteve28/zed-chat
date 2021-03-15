import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { Not, Repository } from 'typeorm';
import { FriendRequest } from '../entities/friendrequest.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class FriendRequestService {
    constructor(
                @Inject(forwardRef(() => UserService))
                private userService: UserService,       
                @InjectRepository(FriendRequest)
                private readonly friendRequestRepository: Repository<FriendRequest>
        ) {}

    async getFriendRequest(id: string): Promise<FriendRequest> {
        return this.friendRequestRepository.findOne(id);
    }
    async getFriendRequests(user: User): Promise<FriendRequest[]> {
        return this.friendRequestRepository.find({ where: { recipientId: user.id, cancelled: false, accepted: false }}); 
    }
    async create(sender: User, recipient: User): Promise<FriendRequest> {
        if(recipient.id === sender.id || recipient.tagName === sender.tagName) {
            return null;
        }
        const friendRequest = new FriendRequest();
        friendRequest.recipientId = recipient.id;
        friendRequest.recipientTagname = recipient.tagName;
        friendRequest.senderId = sender.id;
        friendRequest.senderTagname = sender.tagName;
        return this.friendRequestRepository.save(friendRequest);
    }
    async acceptFriendRequest(id: string): Promise<FriendRequest> {
        const friendRequest =  await this.friendRequestRepository.findOne(id); 
        const newFriend = await this.userService.findOne(friendRequest.recipientId)
        if(friendRequest.senderId && newFriend.id){
            try {
                const [_sender, _newFriend] = await this.userService.addFriends(friendRequest.senderId, newFriend.id);
                if(_sender && _newFriend && _sender.friends && _newFriend.friends){
                    friendRequest.accepted = true;
                    const _friendRequest = await this.friendRequestRepository.save(friendRequest);
                    if(_friendRequest){
                        console.log(_friendRequest);
                        return _friendRequest;
                    }
                }
            }  catch(err) {
                console.log("Cannot accept friend request and add friends", err);
                return null;
            }
        } else {
            console.log("Cannot accept friend request and add friends");
        }
    }
    async declineFriendRequest(id: string): Promise<FriendRequest> {
        const friendRequest =  await this.friendRequestRepository.findOne(id); 
        const newFriend = await this.userService.findOne(friendRequest.recipientId)
        if(friendRequest.senderId && newFriend.id){
            friendRequest.cancelled = true
            return this.friendRequestRepository.save(friendRequest); 
        } else {
            console.log("Cannot decline friend request")
        }
    }
}
