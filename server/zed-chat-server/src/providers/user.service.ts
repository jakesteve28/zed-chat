/**
 * 2021 Jacob Stevens
 * User service is for CRUD operations on the user entity. 
 * A few of the CRUD operations happen frequently. 
 * Might revise to keep frequently changed attributes in a cache/redis storage 
 */

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

  /**
   * Fetches every user in the database.
   * @returns an array of users, or an empty array if it fails/no users
   */
  async findAll(): Promise<User[]> {
    const users = await this.usersRepository.find();
    if(Array.isArray(users)){
      for(const user of users){
        delete user.password;  //Exclude pw TODO: Move to TypeORM @Exclude decorator
        delete user.refreshToken; //Exclude token TODO: ^
      }
      return users;
    }
    else return []; 
  }

  /**
   * Getter for pw. Have to ask specificially for it
   * @param tagName Tagname of the user
   * @returns a string, the hashed password.
   */
  async getPW(tagName: string): Promise<string> {
      const user = await this.usersRepository.findOne( { where: { tagName: tagName } } );
      return user.password;
  }

  /**
   * Getter for the refresh token. Have to ask for it, doesn't include the token by default.
   * @param tagName Tagname of the user
   * @returns a string, the hashed refresh token.
   */
  async getRefreshToken(tagName: string): Promise<string>  {
    const user = await this.usersRepository.findOne( { where: { tagName: tagName } } );
    return user.refreshToken;
  }

  /**
   * Fetches a user by their id. 
   * Also fetches their associated friend requests, and the first 25 messages from all their conversations
   * @param id 
   * @returns the user
   */
  async findOne(id: string): Promise<User> {
      const user = await this.usersRepository.findOne(id, { relations: ["conversations", "friends"] });
      for(const conv of user.conversations){
        conv.messages = await this.conversationService.getMessagesTruncated(user.id, conv.id);
        conv.users = await this.conversationService.getUsers(conv.id);
      }
      user.friendRequests = await this.getFriendRequests(user);
      delete user.password; //TODO: move to @exclude decorator in typeorm
      delete user.refreshToken; //TODO: ^
      return user;
  }

  /**
   * Removes a user from the database,
   * returns a success message if it's been removed
   * @param id 
   * @returns a string with the removed user's ID
   */
  async remove(id: string): Promise<string> {
      await this.usersRepository.delete(id);
      return `User successfully removed ID: ${id}`
  }

  /**
   * The allowed HTTP methods as a str arr
   * @returns 
   */
  options(): any {
      return { availableMethods : ["GET", "POST", "DELETE", "OPTIONS"]}
  }

  /**
   * Similar to findOne, gets a user by their tagname
   * Gets their friend requests, first 25 messages in their convs
   * @param tagName 
   * @returns the user
   */
  async findByTagName(tagName: string): Promise<User> {
    const user = await  this.usersRepository.findOne({ where: {tagName: `${tagName}`}, relations: ["conversations", "friends"]});
    for(const conv of user.conversations){
      conv.messages = await this.conversationService.getMessagesTruncated(user.id, conv.id);
      conv.users = await this.conversationService.getUsers(conv.id);
    }
    user.friendRequests = await this.getFriendRequests(user);
    delete user.password; //TODO @Exclude in typeorm
    delete user.refreshToken; //TODO @Exclude in typeorm
    return user;
  }


  /**
   * Creates a new user in the database
   * @param createUserDto The data transfer object for the client to send
   * @returns a new user
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const user = new User();
      user.firstName = createUserDto.firstName;
      user.lastName = createUserDto.lastName;
      user.email = createUserDto.email;
      user.password = hashedPassword;
      user.tagName = createUserDto.tagName;
      user.friendRequests = [];
      user.friends = [];
      delete createUserDto.password; //TODO @Exclude typeorm
      const _user = await this.usersRepository.save(user);
      delete _user.password; //TODO @Exclude typeorm
      delete _user.refreshToken; //TODO @Exclude typeorm
      return _user; 
  }

  /**
   * Adds a conversation to the user's array of conversations.
   * Both need to exist in advanced
   * @param userId 
   * @param conversationId 
   * @returns a user with the conversation added
   */
  async addConversation(userId: string, conversationId: string): Promise<User> {
    const user = await this.findOne(userId); 
    const conversation = await this.conversationService.findOne(conversationId);
    user.conversations.push(conversation);
    return this.usersRepository.save(user); 
  }

  /**
   * Gets the user's friend returns or returns an empty array
   * @param user 
   * @returns an array of friend requests 
   */
  async getFriendRequests(user: User): Promise<FriendRequest[]> {
    const received = await this.friendRequestService.getFriendRequests(user);
    if(user){
      return received;
    } else console.log("Error: Cannot find user or friend requests for user ")
    return []
  }

  /**
   * Gets an array of the user's friends
   * @param userId 
   * @returns an array of users 
   */
  async getFriends(userId: string): Promise<User[]> {
    const user = await this.findOne(userId);
    if(user && Array.isArray(user.friends)){
      return user.friends
    } else console.log("Error: Cannot find user or friends for user ")
    return []
  }

  /**
   * Adds a friend to the friend's list of the user, and the user to the friend's friends list
   * Both user's must exist
   * @param userId uuidv4 of user adding the friend
   * @param friendId friend's uuidv4 
   * @returns both the friends 2 element array [acceptor, sender]
   */
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

  /**
   * Removes a friend from the user's friends list, and also from the friend's friends list.
   * @param userId 
   * @param exFriendTagname 
   * @returns both the ex-friends in a 2 element array [remover, removee]
   */
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

/**
 * Called every time the user changes chat rooms. 
 * @param userId 
 * @param conversationId 
 * @returns the updated user, or null if error
 */
  async setCurrentConversationId(userId: string, conversationId: string): Promise<User> {
    const user = await this.findOne(userId); 
    if(user && Array.isArray(user.conversations)){
      if(user.conversations.some(conv => conv.id === conversationId)){
         console.log("Setting current conversation ID for user | " + user.tagName + " | to | " + conversationId + " |");
         user.currentConversationId = conversationId;
         const _user = await this.usersRepository.save(user);
         if(_user){
           delete _user.password; //TODO: @exclude typeorm
           delete _user.refreshToken; //TODO: @exclude typeorm
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

  /**
   * Similar to the setCurrentConversation method. Used for mapping notifications to the clients properly 
   * @param userId 
   * @param notificationSocketId 
   * @returns the updated user
   */
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

  /**
   * Same as notification socket it. Chat socket ID changes more.
   * @param userId 
   * @param chatSocketId 
   * @returns The updated user or null
   */
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

  /**
  * Looks up a user by their chat socket ID 
  * @param chatSocketId 
  * @returns 
  */
  async findByChatSocketId(chatSocketId: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { chatSocketId: chatSocketId }});
    if(user){
      delete user.password; 
      delete user.refreshToken; 
      return user;
    } 
    else return null;
  }

  /**
   * Looks up a user by thier notification socket ID 
   * @param notificationSocketId 
   * @returns 
   */
  async findByNotificationSocketId(notificationSocketId: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { notificationSocketId: notificationSocketId }});
    if(user){
      delete user.password; //TODO: @exclude typeorm
      delete user.refreshToken; //TODO: @exclude typeorm
      return user;
    }
    else return null;
  }

  /**
   * Sets the user's loggedin and isOnline columns to true
   * @param userId 
   */
  async markLoggedIn(userId: string) {
    this.usersRepository.update(userId, {
      loggedIn: true, 
      isOnline: true
    });
  }

  /**
   * Checks the saved hashed refresh token in the database compared to what the user sent in. 
   * If they match, success (like a pw), if now fail. 
   * This way, every time a cookie is sent in, we can check the hash of it, and the JWT signature too! 
   * @param userTagname 
   * @param refreshToken
   * @returns true if the hashes match. false otherwise
   */
  async checkHashedRefreshTokenMatch(userTagname: string, refreshToken: string): Promise<boolean> {
    const token = await this.getRefreshToken(userTagname); 
    const res = await bcrypt.compare(refreshToken, token); 
    return res;
  }

  /**
   * Marks a user as logged out and resets their attributes appropriately for an offline user.
   * @param userId 
   * @returns The updated user
   */
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

  /**
   * Sets the user's profile pic string to a link. Users can have one profile pic.
   * @param userId 
   * @param profilePic link address of the profile pic
   * @returns the updated user
   */
  async setProfilePic(userId: string, profilePic: string): Promise<User> {
    const user = await this.findOne(userId);
    if(user){
      user.profilePicture = profilePic;
      return this.usersRepository.save(user);
    }
  }

  /**
   * Same as profile pic, but for background pic. Users can have one custom background pic
   * @param userId 
   * @param fileName 
   * @returns 
   */
  async setBackgroundPic(userId: string, fileName: string): Promise<User> {
    const user = await this.findOne(userId);
    if(user){
      user.backgroundPicture = fileName;
      return this.usersRepository.save(user);
    }
  }

  /**
   * Hashes the refresh token string and saves it in the database
   * @param refreshToken 
   * @param userId 
   */
  async setHashedRefreshToken(refreshToken: string, userId: string) {
    const token = await bcrypt.hash(refreshToken, 10); 
    await this.usersRepository.update(userId, {
      refreshToken: token
    });
  }

  /**
   * Removes the user from the conversation, but doesn't delete the entire thing.
   * @param tagName 
   * @param convId the chatroom's uuidv4
   * @returns the updated user, short a conv in their conv array
   */
  async leaveConversation(tagName: string, convId: string): Promise<User> { 
    const user = await this.findByTagName(tagName);
    user.conversations = user.conversations.filter(conv => conv.id !== convId); 
    return this.usersRepository.save(user);
  }
 } 