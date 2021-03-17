
/**
 * 2021 Jacob Stevens
 * Chat invite/request entity. Users must be friends to chat, and this object facilitates the new chatroom request. 
 * Self explanatory column names and types.
 */

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn  } from 'typeorm';

@Entity()  
export class Invite {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  senderId: string;

  @Column()
  recipientId: string;

  @Column()
  conversationId: string ;

  @Column({ default: false})
  accepted: boolean;

  @Column({ default: false })
  cancelled: boolean;

  @CreateDateColumn()
  createdAt: string;
}