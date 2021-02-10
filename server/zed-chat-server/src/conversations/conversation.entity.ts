import { Message } from '../messages/message.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, CreateDateColumn, OneToMany } from 'typeorm';
import { User } from '../users/user.entity'

@Entity()  
export class Conversation {

  @PrimaryGeneratedColumn("uuid")
    id: string;

  @Column()
    conversationName: string;

  @Column({ default: true })
    pending: boolean;

  @Column({ default: false })
    removed: boolean;

  @CreateDateColumn()
    createdAt: string;

  @ManyToMany(type => User, user => user.conversations, { eager: true })
    users: User[];

  @OneToMany(type  => Message, message => message.conversation)
    messages: Message[];
}