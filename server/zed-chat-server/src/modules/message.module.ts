import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationModule } from './conversation.module';
import { UserModule } from './user.module';
import { Message } from '../entities/message.entity';
import { MessageService } from '../providers/message.service';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), UserModule, ConversationModule],
  providers: [MessageService],
  exports: [MessageService]
})
export class MessageModule {}
