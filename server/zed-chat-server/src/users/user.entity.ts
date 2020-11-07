import { Conversation } from 'src/conversations/conversation.entity';
import { Message } from 'src/messages/message.entity';
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

  @CreateDateColumn()
  createdAt: string;
  
  @ManyToMany(type => Conversation, conversation => conversation.users)
  @JoinTable()
  conversations: Conversation[]

  @OneToMany(type => Message, message => message.user)
  messages: Message[]
}