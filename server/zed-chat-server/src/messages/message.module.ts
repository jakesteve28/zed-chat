import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationModule } from '../conversations/conversation.module';
import { UserModule } from '../users/user.module';
import { Message } from './message.entity';
import { MessageService } from './message.service';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), UserModule, ConversationModule],
  providers: [MessageService],
  exports: [MessageService]
})
export class MessageModule {}
