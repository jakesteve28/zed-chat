/**
 * 2021 Jacob Stevens
 * Conversation entity is analogous to a chat room, and I use the terms interchangeably. 
 * Multiple users belong to a chat room. 
 * Chat room also encapsulates a chronological list of messages, all originating from users belonging only to the chat room.
 * Chat rooms are marked pending when a user has invited others, but no one has accepted. 
 * Chat rooms are only allowed to contain 25 messages at a time. 
 * Anything message saved is kept, but anything not saved has 24 max messages in front of itself.
 * Finally, a password can be set. Only users with the password or pin can get in.
 */

import { Message } from './message.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, CreateDateColumn, OneToMany } from 'typeorm';
import { User } from './user.entity'

@Entity()  
export class Conversation {
  @PrimaryGeneratedColumn("uuid")
    id: string;

  @Column()
    conversationName: string;

  @Column({ default: true })
    pending: boolean;

  @Column({ default: 0 })
    numberOfMessages: number;

  @Column({ default: false })
    removed: boolean;

  @CreateDateColumn()
    createdAt: string;

  //When a user is deleted, conv isn't
  @ManyToMany(type => User, user => user.conversations, { eager: true, onDelete: 'SET NULL' })
    users: User[];

  //When a conv is deleted, so are all of its messages.
  @OneToMany(type  => Message, message => message.conversation, { onDelete: 'CASCADE' })
    messages: Message[];
}