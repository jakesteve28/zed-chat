import { Conversation } from '../conversations/conversation.entity';
import { FriendRequest } from '../friendRequest/friendRequest.entity';
import { Message } from '../messages/message.entity';
import { Entity, Column, PrimaryGeneratedColumn, JoinTable, ManyToMany, OneToMany, CreateDateColumn, OneToOne } from 'typeorm';

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

}