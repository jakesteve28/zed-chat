/**
 * 2021 Jacob Stevens
 * Conversation Module
 * Pretty self explanatory. Read auth.module notes for forwardRef imports
 */

import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationService } from '../providers/conversation.service';
import { ConversationController } from '../controllers/conversation.controller';
import { Conversation } from '../entities/conversation.entity';
import { UserModule } from './user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation]), forwardRef(() => UserModule)],
  providers: [ConversationService],
  controllers: [ConversationController],
  exports: [ConversationService]
})
export class ConversationModule {}