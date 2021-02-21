import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../users/user.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { InviteModule } from '../invites/invite.module';
import { AuthController } from './auth.controller';
import { JwtRefreshStrategy } from './jwt-refresh-strategy';

@Module({
  imports: [forwardRef(() => UserModule), PassportModule,
    JwtModule.register({}), InviteModule
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtRefreshStrategy],
  exports: [AuthService]
})
export class AuthModule {}

