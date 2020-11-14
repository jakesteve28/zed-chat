import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { ConversationModule } from 'src/conversations/conversation.module';
import { FriendRequestModule } from 'src/friendRequest/friendRequest.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => ConversationModule), forwardRef(() => FriendRequestModule)],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService]
})
export class UserModule {}