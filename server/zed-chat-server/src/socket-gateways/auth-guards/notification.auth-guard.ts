import { CanActivate, Injectable } from "@nestjs/common";
import { UserService } from "../../users/user.service";
import { JwtService } from '@nestjs/jwt'
import { jwtConstants } from "src/auth/constants";
import { User } from "src/users/user.entity";
@Injectable()
export class NotificationGuard implements CanActivate {
  constructor(private userService: UserService, private jwtService: JwtService) {
  }
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
    const cookies = context.args[0]?.handshake?.headers?.cookie;
    if(cookies.includes('Refresh=')){
        const index = cookies.lastIndexOf('Refresh=') + 8;
        let i = index;
        let refreshToken = "";
        while(cookies[i] !== ';' &&
              cookies[i] !== ' ' &&
              i < cookies.length) {
          refreshToken += cookies[i++];
        }
        const decoded = this.jwtService.verify(refreshToken);

        console.log(`Cookie/JWT Token Expires: ${decoded?.exp * 1000} | Now: ${Date.now()} | Diff: ${(decoded?.exp * 1000) - Date.now()}`);
        if((decoded?.exp * 1000)  - Date.now() <= 0) {
          return null;
        }
        const user = this.userService.findByTagName(decoded?.username);
        return user;
    } else {
      console.error("Error: Notification Guard no Refresh token included in request!");
      return null;
    }
  }
}
