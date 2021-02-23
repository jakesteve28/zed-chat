import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from '../providers/user.service';
import { jwtConstants } from '../config/constants';
 
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt'
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
      ignoreExpiration: false
    });
  }
 
  async validate(request: Request, payload: any) {
    const refreshToken = request.cookies?.Refresh;
    if(await this.userService.checkHashedRefreshTokenMatch(payload.username, refreshToken)){
        return this.userService.findByTagName(payload.username)
    }
    return false;
  }
}