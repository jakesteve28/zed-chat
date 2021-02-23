import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToOne, ManyToOne, CreateDateColumn } from 'typeorm';
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

  @ManyToOne(type => Conversation, conversation => conversation.messages, {
    eager: true
  })
  conversation: Conversation
}