import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from '../users/user.service';
import { jwtConstants } from './constants';
 
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token'
) {
  constructor(
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => {
        return request?.cookies?.Refresh;
      }]),
      secretOrKey: jwtConstants.refreshSecret,
      passReqToCallback: true,
    });
  }
 
  async validate(request: Request, payload: any) {
    const refreshToken = request.cookies?.Refresh;
    if(await this.userService.checkRefreshTokenMatch(refreshToken, payload.userId)){
        return this.userService.findOne(payload.userId)
    }
    return null;
  }
}