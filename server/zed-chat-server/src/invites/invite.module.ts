import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InviteGateway } from './invite.gateway';
import { ConversationModule } from '../conversations/conversation.module';
import { UserModule } from '../users/user.module';
import { InviteController } from './invite.controller';
import { Invite } from './invite.entity';
import { InviteService } from './invite.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/constants';

@Module({
  imports: [JwtModule.register({
    secret: jwtConstants.secret,
    signOptions: {expiresIn: '24h'}
  }),
  UserModule, ConversationModule, TypeOrmModule.forFeature([Invite])],
  controllers: [InviteController],
  providers: [InviteService, InviteGateway]
})
export class InviteModule {}
