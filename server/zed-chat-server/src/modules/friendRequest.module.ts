import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user.module';
import { FriendRequest } from '../entities/friendrequest.entity';
import { FriendRequestService } from '../providers/friendRequest.service';

@Module({
  imports: [
  forwardRef(() => UserModule),
  TypeOrmModule.forFeature([FriendRequest])],
  providers: [FriendRequestService],
  exports: [FriendRequestService]
})
export class FriendRequestModule {}
