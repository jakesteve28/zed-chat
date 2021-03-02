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
  session: string;

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
  
  @ManyToMany(type => Conversation, conversation => conversation.users)
  @JoinTable()
  conversations: Conversation[]

  @OneToMany(type => Message, message => message.user)
  messages: Message[]

  @ManyToMany(type => User, user => user.friends)
  @JoinTable()
  friends: User[];

  @OneToMany(type => FriendRequest, friendRequest => friendRequest.sender)
  friendRequests: FriendRequest[]

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

}