import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../entities/dto/create-user.dto';
import * as bcrypt from 'bcrypt'
import { ConversationService } from './conversation.service';
import { FriendRequest } from '../entities/friendrequest.entity';
import { FriendRequestService } from './friendRequest.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>, 
    private conversationService: ConversationService,
    @Inject(forwardRef(() => FriendRequestService))
    private friendRequestService: FriendRequestService
  ) { }

  async findAll(): Promise<User[]> {
    const users = await this.usersRepository.find();
    if(Array.isArray(users)){
      for(const user of users){
        delete user.password; 
        delete user.refreshToken; 
      }
      return users;
    }
    else return []; 
  }

  async getPW(tagName: string): Promise<string> {
      const user = await this.usersRepository.findOne( { where: { tagName: tagName } } );
      return user.password;
  }

  async getRefreshToken(tagName: string): Promise<string>  {
    const user = await this.usersRepository.findOne( { where: { tagName: tagName } } );
    return user.refreshToken;
  }

  async findOne(id: string): Promise<User> {
      const user = await this.usersRepository.findOne(id, { relations: ["conversations", "friends"] });
      for(const conv of user.conversations){
        conv.messages = await this.conversationService.getMessagesTruncated(user.id, conv.id);
        conv.users = await this.conversationService.getUsers(conv.id);
      }
      user.friendRequests = await this.getFriendRequests(user);
      delete user.password; 
      delete user.refreshToken;
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
    const user = await  this.usersRepository.findOne({ where: {tagName: `${tagName}`}, relations: ["conversations", "friends"]});
    for(const conv of user.conversations){
      conv.messages = await this.conversationService.getMessagesTruncated(user.id, conv.id);
      conv.users = await this.conversationService.getUsers(conv.id);
    }
    user.friendRequests = await this.getFriendRequests(user);
    delete user.password; 
    delete user.refreshToken;
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const user = new User();
      user.firstName = createUserDto.firstName;
      user.lastName = createUserDto.lastName;
      user.email = createUserDto.email;
      user.password = hashedPassword;
      user.session = createUserDto.session;
      user.tagName = createUserDto.tagName;
      user.friendRequests = [];
      user.friends = [];
      delete createUserDto.password;
      const _user = await this.usersRepository.save(user);
      delete _user.password; 
      delete _user.refreshToken;
      return _user; 
  }

  async addConversation(userId: string, conversationId: string): Promise<User> {
    const user = await this.findOne(userId); 
    const conversation = await this.conversationService.findOne(conversationId);
    user.conversations.push(conversation);
    return this.usersRepository.save(user); 
  }

  async getFriendRequests(user: User): Promise<FriendRequest[]> {
    const received = await this.friendRequestService.getFriendRequests(user);
    if(user){
      return received;
    } else console.log("Error: Cannot find user or friend requests for user ")
    return []
  }

  async getFriends(userId: string): Promise<User[]> {
    const user = await this.findOne(userId);
    if(user && Array.isArray(user.friends)){
      return user.friends
    } else console.log("Error: Cannot find user or friends for user ")
    return []
  }

  async addFriends(userId: string, friendId: string): Promise<[User, User]> {
    const user = await this.findOne(userId);
    const newFriend = await this.findOne(friendId);
    if(user && Array.isArray(user?.friends) && 
        newFriend && Array.isArray(newFriend?.friends)){
      if(user.friends.some(fr => fr.id === newFriend.id)){
        console.error(`Error: Cannot add friend to user, already exists in user's friend's list`);
        return null;
      }
      if(newFriend.friends.some(fr => fr.id === user.id)){
        console.error(`Error: Cannot add friend to new friend, already exists in new friend's friend's list`);
        return null;
      }
      user.friends.push(newFriend);
      newFriend.friends.push(user);
      return [await this.usersRepository.save(user), await this.usersRepository.save(newFriend)];
    }
  }

  async removeFriends(userId: string, exFriendTagname: string): Promise<[User, User]> {
    const user = await this.findOne(userId);
    const exFriend = await this.findByTagName(exFriendTagname);
    if(user && Array.isArray(user.friends) && 
        exFriend && Array.isArray(exFriend.friends)) {
      if(!user.friends.some(fr => fr.id === exFriend.id)){
        console.error(`Cannot remove friend from user, doesn't actually exist in user's friend's list`);
        return null;
      }
      if(!exFriend.friends.some(fr => fr.id === user.id)){
        console.error(`Cannot remove friend from ex friend, doesn't actually exist in ex's friend's list`);
        return null;
      }
      user.friends = user.friends.filter((friend) => { return friend.id !== exFriend.id });
      exFriend.friends = exFriend.friends.filter((friend) => { return friend.id !== user.id });
      return [await this.usersRepository.save(user), await this.usersRepository.save(exFriend)]
    }
  }

  async setCurrentConversationId(userId: string, conversationId: string): Promise<User> {
    const user = await this.findOne(userId); 
    if(user && Array.isArray(user.conversations)){
      if(user.conversations.some(conv => conv.id === conversationId)){
         console.log("Setting current conversation ID for user | " + user.tagName + " | to | " + conversationId + " |");
         user.currentConversationId = conversationId;
         const _user = await this.usersRepository.save(user);
         if(_user){
           delete _user.password;
           delete _user.refreshToken; 
           return _user;
         }
         console.error("Error: can't set current conversation for user | " + user.tagName + " |");
         return null;
      } 
      console.error("Error: cannot find conversation with ID | " + conversationId + " |");
      return null;
    }
    console.error("Error: cannot find user with ID | " + userId + " |");
    return null;
  }

  async setNotificationSocketId(userId: string, notificationSocketId: string): Promise<User> {
    const user = await this.findOne(userId); 
    if(user){
        console.log("Setting notification socket ID for user | " + user.tagName + " | to | " + notificationSocketId + " |");
        user.notificationSocketId = notificationSocketId;
        if(notificationSocketId === 'disconnected') {
          user.loggedIn = false;
          user.isOnline = false;
          user.currentConversationId = '0'; 
        }
        const _user = await this.usersRepository.save(user);
        if(_user){
          delete _user.password;
          delete _user.refreshToken; 
          return _user;
        }
    } 
    console.error("Error: cannot find user with ID | " + userId + " |");
    return null;
  }

  async setChatSocketId(userId: string, chatSocketId: string): Promise<User> {
    const user = await this.findOne(userId); 
    if(user){
        console.log(`Setting chat socket ID for user | ${user.tagName} | to |  ${chatSocketId}  |`);
        user.chatSocketId = chatSocketId;
        if(chatSocketId === 'disconnected') {
          user.loggedIn = false;
          user.isOnline = false;
          user.currentConversationId = '0'; 
        }
        const _user = await this.usersRepository.save(user);
        if(_user){
          delete _user.password;
          delete _user.refreshToken; 
          return _user;
        }
    } 
    console.error("Error: cannot find user with ID | " + userId + " |");
    return null;
  }

  async findByChatSocketId(chatSocketId: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { chatSocketId: chatSocketId }});
    if(user){
      delete user.password; 
      delete user.refreshToken; 
      return user;
    } 
    else return null;
  }

  async findByNotificationSocketId(notificationSocketId: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { notificationSocketId: notificationSocketId }});
    if(user){
      delete user.password; 
      delete user.refreshToken; 
      return user;
    }
    else return null;
  }

  async markLoggedIn(userId: string) {
    this.usersRepository.update(userId, {
      loggedIn: true, 
      isOnline: true
    });
  }

  async checkHashedRefreshTokenMatch(userTagname: string, refreshToken: string): Promise<boolean> {
    const token = await this.getRefreshToken(userTagname); 
    const res = await bcrypt.compare(refreshToken, token); 
    return res;
  }

  async logout(userId: string): Promise<User> {
    const user = await this.findOne(userId);
    if(user){
      if(user.loggedIn === false) {
         console.log("User already marked as logged out in database"); 
         return user;
      }
      user.loggedIn = false;
      user.chatSocketId = 'disconnected';
      user.notificationSocketId = 'disconnected'; 
      user.currentConversationId = '0';
      user.refreshToken = ''; 
      user.isOnline = true;
      return this.usersRepository.save(user);
    }
  }

  async setProfilePic(userId: string, profilePic: string): Promise<User> {
    const user = await this.findOne(userId);
    if(user){
      user.profilePicture = profilePic;
      return this.usersRepository.save(user);
    }
  }

  async setBackgroundPic(userId: string, fileName: string): Promise<User> {
    const user = await this.findOne(userId);
    if(user){
      user.backgroundPicture = fileName;
      return this.usersRepository.save(user);
    }
  }

  async setHashedRefreshToken(refreshToken: string, userId: string) {
    const token = await bcrypt.hash(refreshToken, 10); 
    await this.usersRepository.update(userId, {
      refreshToken: token
    });
  }
  async leaveConversation(tagName: string, convId: string): Promise<User> { 
    const user = await this.findByTagName(tagName);
    user.conversations = user.conversations.filter(conv => conv.id !== convId); 
    return this.usersRepository.save(user);
  }
 } 