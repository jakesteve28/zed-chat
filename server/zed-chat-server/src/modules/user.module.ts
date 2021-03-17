/**
 * 2021 Jacob Stevens
 * User Module 
 * Pretty self explanatory. Read auth.module notes for forwardRef imports
 */

import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from '../providers/user.service';
import { UserController } from '../controllers/user.controller';
import { User } from '../entities/user.entity';
import { ConversationModule } from './conversation.module';
import { FriendRequestModule } from './friendRequest.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => ConversationModule), forwardRef(() => FriendRequestModule)],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService]
})
export class UserModule {}