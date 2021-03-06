import { CanActivate, Injectable } from "@nestjs/common";
import { UserService } from "src/users/user.service";
import { JwtService } from '@nestjs/jwt'
@Injectable()
export class FriendRequestGuard implements CanActivate {
  constructor(private userService: UserService, private jwtService: JwtService) {
  }
  async canActivate(context: any): Promise<any> {
    if(!context || context.contextType !== 'ws') throw `Context type of ${context.contextType} not allowed`
    try {
      console.log("Starting friend request guard")
      const bearerToken = context.args[0].handshake.headers.authorization.split(' ')[1];
      const decoded = this.jwtService.verify(bearerToken) as any;
      const user = await this.userService.findByTagName(decoded.username)
      try {
        if(user){
            console.log(user)
            return true     
        } else
          throw "User does not exist: " + user + ", username: " + decoded.username
      } catch(err) {
        console.log(err)
        return false;
      } 
    } catch (ex) {
      console.log(ex)
      return false;
    }
  }
}