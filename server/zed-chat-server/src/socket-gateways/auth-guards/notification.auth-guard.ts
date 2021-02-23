import { CanActivate, Injectable } from "@nestjs/common";
import { UserService } from "../../users/user.service";
import { JwtService } from '@nestjs/jwt'
import { User } from "src/users/user.entity";
import extractRefreshTokenFromCookie from "./auth-guard.util";
import { jwtConstants } from "src/auth/constants";

@Injectable()
export class NotificationGuard implements CanActivate {
  constructor(private userService: UserService, private jwtService: JwtService) { }
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
