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

  @ManyToMany(type => User, user => user.conversations, { eager: true })
    users: User[];

  @OneToMany(type  => Message, message => message.conversation)
    messages: Message[];
}