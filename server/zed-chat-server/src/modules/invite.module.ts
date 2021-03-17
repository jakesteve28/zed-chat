/**
 * 2021 Jacob Stevens
 * Invite Module
 * Pretty self explanatory. Read auth.module notes for forwardRef imports
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationModule } from './conversation.module';
import { UserModule } from './user.module';
import { Invite } from '../entities/invite.entity';
import { InviteService } from '../providers/invite.service';
import { FriendRequestModule } from './friendRequest.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../config/constants';

@Module({
  imports: [
    JwtModule.register({
      secret: jwtConstants.refreshSecret
    }),
    UserModule,
    ConversationModule, 
    FriendRequestModule, 
    TypeOrmModule.forFeature([Invite])],
  providers: [InviteService],
  exports: [InviteService]
})
export class InviteModule {}
