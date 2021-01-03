import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { jwtConstants } from '../auth/constants';
import { UserModule } from '../users/user.module';
import { FriendRequest } from './friendRequest.entity';
import { FriendRequestService } from './friendRequest.service';

@Module({
  imports: [
      JwtModule.register({
    secret: jwtConstants.secret,
    signOptions: {expiresIn: '24h'}
  }), 
  forwardRef(() => UserModule),
  TypeOrmModule.forFeature([FriendRequest])],
  providers: [FriendRequestService],
  exports: [FriendRequestService]
})
export class FriendRequestModule {}
