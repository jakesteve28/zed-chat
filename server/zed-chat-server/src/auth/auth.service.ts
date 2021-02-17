import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { UserService } from '../users/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InviteService } from 'src/invites/invite.service';

export interface jwtPayload {
   username: string,
   sub: string 
}

@Injectable()
export class AuthService {
  constructor(
      @Inject(forwardRef(() => UserService)) 
      private userService: UserService, 
      private jwtService: JwtService,
      private inviteService: InviteService
    ) 
  {}
  async validateUser(tagName: string, pass: string): Promise<any> {
    try {
      const user = await this.userService.findByTagName(tagName);
      if(!user){
        throw "User not found";
      }
      if(user.loggedIn === true) {
        console.log("User @" + tagName  + " already logged in!");
        console.warn("Allowing login for dev purposes only...");
        //throw "User already logged in!";
      }
      const passwordMatching = await bcrypt.compare(
          pass,
          user.password
      )
      if (passwordMatching === true) {
        console.log(`Logging in User: ${tagName}`);
        const loggedInUser = await this.userService.login(user.id);
        delete loggedInUser.password;
        return loggedInUser;
      }
    } catch(err){
      throw new HttpException('Wrong credentials provided ' + err, HttpStatus.BAD_REQUEST);
    }
  }
  async login(user: any){
      const payload: jwtPayload = { 
        username: user.tagName, 
        sub: user.id,
      } 
      return {
          user: user,
          invites: await this.inviteService.getInvitesByUser(user.id),
          token: this.jwtService.sign(payload),
          id: user.id
      }
  }
}