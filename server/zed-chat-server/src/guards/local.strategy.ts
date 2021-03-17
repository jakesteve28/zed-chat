/**
 * 2021 Jacob Stevens
 * Local strategy uses the auth providers validation method to see if the user's given pw matches the db's hash 
 * Then it exposes the user to methods further down the request middleware chain if successful...
 */

import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../providers/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'tagName'
    });
  }
  /**
   * This guard is only called when login is called. 
   * It fetches everything the user needs (friend requests, invites, all),
   * and attaches it to the req.user object
   * @param tagName The tagname of the user trying to login
   * @param password The pw of the user
   */
  async validate(tagName: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(tagName, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}