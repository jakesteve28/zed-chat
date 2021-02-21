import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationModule } from '../conversations/conversation.module';
import { UserModule } from '../users/user.module';
import { Invite } from './invite.entity';
import { InviteService } from './invite.service';
import { FriendRequestModule } from '../friendRequest/friendRequest.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/constants';

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
