import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { UserService } from '../users/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InviteService } from '../invites/invite.service';
import { User } from '../users/user.entity';
import { jwtConstants } from './constants';

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
  private enforceSingleClientConnection(user: User){
    if(!user){
      console.error("User not found");
      return false;
    } 
    if(user.loggedIn === true) {
      console.log("User @" + user.tagName  + " already logged in!");
      console.warn("Allowing login for dev purposes only...");
      //return false;
    } 
    return true;
  }
  //Called from LocalAuthGuard
  async validateUser(tagName: string, pass: string): Promise<any> {
    try {
      const user = await this.userService.findByTagName(tagName);
      if(true === this.enforceSingleClientConnection(user)){
        const passwordMatching = await bcrypt.compare(
          pass,
          user.password
        )
        if (passwordMatching === true) {
          console.log(`Logging in User: ${tagName}`);
          await this.userService.markLoggedIn(user.id);
          const loggedInUser = await this.userService.fetchMessages(user.id);
          delete loggedInUser.password;
          return loggedInUser;
        }
      } else throw 'No User With Given Username';
    } catch(err){
      throw new HttpException('Wrong credentials provided ' + err, HttpStatus.BAD_REQUEST);
    }
  }
  //Called from Auth Controller
  async login(user: any){
      return {
          user: user,
          invites: await this.inviteService.getInvitesByUser(user.id),
          refreshToken: await this.refreshToken(user),
          id: user.id
      }
  }

  async getUserForTokenLogin(user: any) {
    await this.userService.markLoggedIn(user.id);
    const loggedInUser = await this.userService.fetchMessages(user.id);
      return {
        user: loggedInUser,
        invites: await this.inviteService.getInvitesByUser(user.id),
        id: user.id
    }
  }

  async logout(user: any) {
    const _user = await this.userService.logout(user.id); 
    if(_user) {
      console.log(`User @${_user.tagName} logged out`);
      return true; 
    }
    return false;
  }

  public async refreshToken(user: any) {
    const payload: jwtPayload = { 
      username: user?.tagName, 
      sub: user?.id
    } 
    const refreshToken = this.jwtService.sign(payload, {
      secret: jwtConstants.refreshSecret,
      expiresIn: '900s'
    });
    await this.userService.setCurrentRefreshToken(refreshToken, user?.id); 
    return refreshToken;
  }
}