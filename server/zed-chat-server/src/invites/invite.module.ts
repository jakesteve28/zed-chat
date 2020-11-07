import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationModule } from 'src/conversations/conversation.module';
import { UserModule } from 'src/users/user.module';
import { InviteController } from './invite.controller';
import { Invite } from './invite.entity';
import { InviteService } from './invite.service';

@Module({
  imports: [UserModule, ConversationModule, TypeOrmModule.forFeature([Invite])],
  controllers: [InviteController],
  providers: [InviteService]
})
export class InviteModule {}
