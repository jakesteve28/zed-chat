/**
 * 2021 Jacob Stevens 
 * Socket messages that go through the notification gateway are guarded with this. 
 * It's essentially the same as Chat Guard. The validation here comes from verifying the refresh cookie. 
 * No context argument structure/type validation occurs here.
 */

import { CanActivate, Injectable } from "@nestjs/common";
import { UserService } from "../providers/user.service";
import { JwtService } from '@nestjs/jwt'
import { User } from "src/entities/user.entity";
import extractRefreshTokenFromCookie from "./auth-guard.util";
import { jwtConstants } from "src/config/constants";

@Injectable()
export class NotificationGuard implements CanActivate {
  constructor(private userService: UserService, private jwtService: JwtService) { }
  /**
   * The overridden method for CanActivate interface, determines if requesting user contains a valid, signed cookie
   * @param context the request's execution context
   * @returns true if the request's cookie is valid. False if not.
   */
  async canActivate(context: any): Promise<any> {
    if(!context || context.contextType !== 'ws') throw `Context type of ${context.contextType} not allowed`
    try {
        const user = await this.verifyJwt(context);
        if(user){
          console.log(`Success: Notification from user @${user.tagName} passed notification guard`);
          return true;    
        } else return false;
    } catch (ex) {
      console.log(ex)
      return false;
    }
  }
  /**
   * Called by canActivate, this extracts the cookie from the context's arguments and verifies that its signed
   * TODO: Also check that the cookie matches the saved hash in the database? 
   * @param context the request's execution context
   * @returns the user if the cookie is valid, null otherwise.
   */
  verifyJwt(context: any): Promise<User> {
      const refreshToken = extractRefreshTokenFromCookie(context.args[0]?.handshake?.headers?.cookie);
      if(!refreshToken) {
        console.error("Error: NotificationGuard | No refresh token included in request!");
        return null;
      }
      const decoded = this.jwtService.verify(refreshToken, { secret: jwtConstants.refreshSecret });
      if((decoded?.exp * 1000)  - Date.now() <= 0) {
        console.error("Error: NotificationGuard | JWT expiration time error");
        return null;
      }
      console.log(`NotificationGuard verified JWT successfully: Cookie/JWT Token Expires: ${decoded?.exp * 1000} | Now: ${Date.now()} | Diff: ${(decoded?.exp * 1000) - Date.now()}`);
      const user = this.userService.findByTagName(decoded?.username);
      return user;
  } 
}
