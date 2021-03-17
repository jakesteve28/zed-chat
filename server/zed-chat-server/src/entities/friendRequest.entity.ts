
/**
 * 2021 Jacob Stevens
 * Friend request entity. Users must be friends to chat, and this object facilitates in creation of friend connections. 
 * Self explanatory column names and types.
 */

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn  } from 'typeorm';

@Entity()  
export class FriendRequest {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  senderTagname: string;

  @Column()
  recipientTagname: string;

  @Column()
  senderId: string;

  @Column()
  recipientId: string;

  @Column({ default: false })
  accepted: boolean;

  @Column({ default: false })
  cancelled: boolean;

  @CreateDateColumn()
  createdAt: string;
}