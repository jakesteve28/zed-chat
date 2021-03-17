/**
 * 2021 Jacob Stevens
 * The authentication module.
 * Exposes APIs related to authentication. 
 * Controller employs strategies for giving/verifying cookies.
 * Needs passport and a forwardRef to the UserModule (UserModule also imports the AuthModule)
 */

import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from '../providers/auth.service';
import { UserModule } from './user.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from '../guards/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { InviteModule } from './invite.module';
import { AuthController } from '../controllers/auth.controller';
import { JwtRefreshStrategy } from '../guards/jwt-refresh-strategy';

@Module({
  imports: [forwardRef(() => UserModule), PassportModule,
    JwtModule.register({}), InviteModule
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtRefreshStrategy],
  exports: [AuthService]
})
export class AuthModule {}

