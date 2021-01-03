import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationModule } from '../conversations/conversation.module';
import { UserModule } from '../users/user.module';
import { InviteController } from './invite.controller';
import { Invite } from './invite.entity';
import { InviteService } from './invite.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/constants';
import { FriendRequestModule } from '../friendRequest/friendRequest.module';

@Module({
  imports: [JwtModule.register({
    secret: jwtConstants.secret,
    signOptions: {expiresIn: '24h'}
  }),
  UserModule, ConversationModule, FriendRequestModule, TypeOrmModule.forFeature([Invite])],
  controllers: [InviteController],
  providers: [InviteService],
  exports: [InviteService]
})
export class InviteModule {}
