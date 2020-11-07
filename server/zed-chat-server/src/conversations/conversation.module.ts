import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { Conversation } from './conversation.entity';
import { UserModule } from 'src/users/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation]), forwardRef(() => UserModule)],
  providers: [ConversationService],
  controllers: [ConversationController],
  exports: [ConversationService]
})
export class ConversationModule {}