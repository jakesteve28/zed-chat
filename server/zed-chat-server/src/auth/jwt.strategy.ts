import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';
import { UserService } from '../users/user.service';
import { Request } from 'express';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => {
        return request?.cookies?.Authentication;
      }]),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.accessSecret,
      passReqToCallback: true
    });
  }
  async validate(request: Request, payload: any) {
    return this.userService.findOne(payload.userId);
  }
}