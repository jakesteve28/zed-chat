import { Message } from 'src/messages/message.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, CreateDateColumn, OneToMany } from 'typeorm';
import { User } from '../users/user.entity'

@Entity()  
export class Conversation {

  @PrimaryGeneratedColumn("uuid")
    id: string;

  @Column()
    conversationName: string;

  @CreateDateColumn()
    createdAt: string;

  @ManyToMany(type => User, user => user.conversations)
    users: User[];

  @OneToMany(type  => Message, message => message.conversation)
    messages: Message[];
}