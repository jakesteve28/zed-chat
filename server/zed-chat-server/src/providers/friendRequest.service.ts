/**
 * 2021 Jacob Stevens
 * Friend Request Service 
 * Responsible for exposing some CRUD methods for friend requests and the associated users. 
 */

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
    /**
     * Returns a friend request given its uuidv4.
     * @param id 
     * @returns 
     */
    async getFriendRequest(id: string): Promise<FriendRequest> {
        return this.friendRequestRepository.findOne(id);
    }

    /**
     * Gets a list of friend requests that haven't been cancelled or accepted yet for a user, given the User's uuidv4
     * @param user req.user, using their uuidv4
     * @returns a list of friend requests that haven't been declined/cancelled or accepted yet
     */
    async getFriendRequests(user: User): Promise<FriendRequest[]> {
        return this.friendRequestRepository.find({ where: { recipientId: user.id, cancelled: false, accepted: false }}); 
    }

    /**
     * Creates and saves a friend request.
     * TODO: Some validation occurs here which needs to occur in the controller method.
     * @param sender sender user of the friend request
     * @param recipient intended recipient of the friend request
     * @returns a new friend request
     */
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

    /**
     * Accept friend request, goes and adds the users to each other's friend's lists and saves,
     * then marks as accecpted and saves the friend request
     * @param id id of the friend request
     * @returns the accepted friend request
     */
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

    /**
     * Very similar as accept friend request, but marks it as declined instead and returns. 
     * @param id 
     * @returns The declined friend request
     */
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
