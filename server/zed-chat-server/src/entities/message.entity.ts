/**
 * 2021 Jacob Stevens
 * Message entity. A pinned message is saved from deletion when the auto delete feature deletes older messages. 
 * A message is marked read when a non-sending member of the message's associated conversation sets their current conversation to it. 
 * The sender is the "user" column. 
 * The conversation is the chatroom this message was sent to.
 * Self explanatory column names and types.
 */

import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity'
import { Conversation } from './conversation.entity'

@Entity()  
export class Message {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  body: string;

  @Column({ default: false })
  pinned: boolean;

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn()
  createdAt: string;

  @ManyToOne(type => User, user => user.messages, {
    eager: true
  })
  user: User

  //If the message is deleted, don't delete the conversation... just set the join table right side to null..
  @ManyToOne(type => Conversation, conversation => conversation.messages, {
    eager: true, onDelete: 'SET NULL'
  })
  conversation: Conversation
}