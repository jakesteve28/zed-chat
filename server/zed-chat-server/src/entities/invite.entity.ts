import { Entity, Column, PrimaryGeneratedColumn, Unique, JoinTable, ManyToMany, OneToMany, CreateDateColumn, ManyToOne,  } from 'typeorm';

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