
import { User } from 'src/users/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne  } from 'typeorm';

@Entity()  
export class FriendRequest {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(type => User, sender => sender.friendRequests, { eager: true})
  sender: User

  @Column()
  recipientId: string;

  @Column({ default: false})
  accepted: boolean;

  @Column({ default: false })
  cancelled: boolean;

  @CreateDateColumn()
  createdAt: string;
}