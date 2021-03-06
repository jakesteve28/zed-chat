import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt'
import { ConversationService } from 'src/conversations/conversation.service';
import { FriendRequest } from 'src/friendRequest/friendRequest.entity';
import { FriendRequestService } from 'src/friendRequest/friendRequest.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>, 
    private conversationService: ConversationService,
    private friendRequestService: FriendRequestService
  ) {
    
  }
  findAll(): Promise<User[]> {
      return this.usersRepository.find();
  }
  async findOne(id: string): Promise<User> {
      const user = await this.usersRepository.findOne(id, { relations: ["conversations", "friends", "friendRequests"] });
      for(let conv of user.conversations){
        conv.messages = await this.conversationService.getMessages(conv.id);
      }
      return user;
  }
  async remove(id: string): Promise<string> {
      await this.usersRepository.delete(id);
      return `User successfully removed ID: ${id}`
  }
  options(): any {
      return { availableMethods : ["GET", "POST", "DELETE", "OPTIONS"]}
  }
  async findByTagName(tagName: string): Promise<User> {
    const user = await  this.usersRepository.findOne({ where: {tagName: `${tagName}`}, relations: ["conversations", "friends", "friendRequests"]});
    return user;
  }
  async create(createUserDto: CreateUserDto): Promise<User> {
      let hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const user = new User();
      user.firstName = createUserDto.firstName;
      user.lastName = createUserDto.lastName;
      user.email = createUserDto.email;
      user.password = hashedPassword;
      user.session = createUserDto.session;
      user.tagName = createUserDto.tagName;
      user.friendRequests = []
      user.friends = []
      createUserDto.password = undefined;
      const us = await this.usersRepository.save(user);
      us.password = undefined
      return us
  }
  async addConversation(userId: string, conversationId: string): Promise<User> {
    const user = await this.usersRepository.findOne(userId, { relations: ["conversations"]});
    const conversation = await this.conversationService.findOne(conversationId);
    user.conversations.push(conversation);
    //user.password = undefined
    return user
  }
  async getFriendRequests(userId: string): Promise<FriendRequest[]> {
    const user = await this.usersRepository.findOne(userId, { relations: ["friendRequests"]});
    //user.password = undefined
    const received = await this.friendRequestService.getFriendRequestsReceivedByUser(userId);
    console.log("User sent: ", user.friendRequests)
    console.log("User received: ", received)
    if(user && user.friendRequests){
      return [...user.friendRequests, ...received]
    } else console.log("Cannot find user or friend requests for user ")
    return []
  }
  async getFriends(userId: string): Promise<User[]> {
    const user = await this.usersRepository.findOne(userId, { relations: ["friends"]});
    //user.password = undefined
    if(user && user.friends){
      return user.friends
    } else console.log("Cannot find user or friends for user ")
    return []
  }
  async addFriends(userId: string, friendId: string): Promise<[User, User]> {
    const user = await this.usersRepository.findOne(userId, { relations: ["friends"]});
    //user.password = undefined
    const newFriend = await this.usersRepository.findOne(friendId, { relations: ["friends"]});
    newFriend.password = undefined
    if(user && user.friends && newFriend && newFriend.friends){
      if(user.friends.filter(fr => fr.id === newFriend.id).length > 0){
        console.log("Cannot add friend to user, already exists in user's friend's list")
        return
      }
      if(newFriend.friends.filter(fr => fr.id === user.id).length > 0){
        console.log("Cannot add friend to new friend, already exists in new friend's friend's list")
        return
      }
      user.friends.push(newFriend)
      newFriend.friends.push(user)
      return [await this.usersRepository.save(user), await this.usersRepository.save(newFriend)]
    }
  }
  async removeFriends(userId: string, exFriendId: string) {
    const user = await this.usersRepository.findOne(userId, { relations: ["friends"]});
    const exFriend = await this.usersRepository.findOne(exFriendId, { relations: ["friends"]});
    if(user && user.friends && exFriend && exFriend.friends){
      if(user.friends.filter(fr => fr.id === exFriend.id).length < 1){
        console.log("Cannot remove friend from user, doesn't exist in user's friend's list")
        return
      }
      if(exFriend.friends.filter(fr => fr.id === user.id).length < 1){
        console.log("Cannot remove friend from ex friend,  doesn't exist  in ex's friend's list")
        return
      }
      user.friends = user.friends.filter((friend) => { return friend.id !== exFriend.id })
      exFriend.friends = exFriend.friends.filter((friend) => { return friend.id !== user.id })
      return [await this.usersRepository.save(user), await this.usersRepository.save(exFriend)]
    }
  }
}