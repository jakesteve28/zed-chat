
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