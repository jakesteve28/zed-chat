import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../users/user.module';
import { FriendRequest } from './friendRequest.entity';
import { FriendRequestService } from './friendRequest.service';

@Module({
  imports: [
  forwardRef(() => UserModule),
  TypeOrmModule.forFeature([FriendRequest])],
  providers: [FriendRequestService],
  exports: [FriendRequestService]
})
export class FriendRequestModule {}
