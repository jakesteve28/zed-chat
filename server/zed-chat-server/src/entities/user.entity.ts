/**
 * 2021 Jacob Stevens
 * The monster entity... 
 * The User entity comprises of all the columns I need for their account settings, and associated client session.
 * There are two types of columns in this entity. Some change often from socket updates or authentication updates,
 * while others only change when the user enters their password and logs in and out (their email, PW). 
 * 
 * Volatile Update Columns: 
 *  currentConversationId (Used by business logic for typing events, possible business logic hook expansion here)
 *  chatSocketId (Used by business logic for server sent events)
 *  notificationSocketId (same as chat socket)
 *  loggedIn/isOnline (used by friend's list to determine if they're online)
 *  refreshToken (used by business logic for authentication)
 * 
 * All other columns are only updated by the user as requested.  
 * Users have messages, conversations, friends joined in the database.
 * Friend requests and chat invites simply use the IDs of users instead of a join. 
 */

import { Conversation } from './conversation.entity';
import { FriendRequest } from './friendrequest.entity';
import { Message } from './message.entity';
import { Entity, Column, PrimaryGeneratedColumn, JoinTable, ManyToMany, OneToMany, CreateDateColumn } from 'typeorm';

@Entity()  
export class User {

  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  password: string;
  
  @Column()
  tagName: string;

  @Column({ default: false })
  isOnline: boolean;

  @Column()
  currentConversationId: string;

  @Column({ default: 'disconnected' })
  chatSocketId: string;

  @Column({ default: 'disconnected' })
  notificationSocketId: string;

  @CreateDateColumn()
  createdAt: string;
  
  @ManyToMany(type => Conversation, conversation => conversation.users, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinTable()
  conversations: Conversation[]

  @OneToMany(type => Message, message => message.user)
  messages: Message[]

  @ManyToMany(type => User, user => user.friends)
  @JoinTable()
  friends: User[];

  @Column({ default: false })
  loggedIn: boolean; 

  @Column({ default: false })
  flagged: boolean; 

  @Column({ default: false })
  disabled: boolean;

  @Column({ default: "" })
  profilePicture: string;

  @Column({ default: "" })
  refreshToken: string;

  @Column({ default: "" })
  backgroundPicture: string;

  friendRequests: FriendRequest[];
}