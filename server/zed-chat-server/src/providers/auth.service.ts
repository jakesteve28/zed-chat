import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InviteService } from './invite.service';
import { User } from '../entities/user.entity';
import { jwtConstants } from '../config/constants';

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
      const userPW = await this.userService.getPW(tagName);
      const passwordMatching = await bcrypt.compare(
        pass,
        userPW
      )
      if (passwordMatching === true) {
          console.log(`Logging in User: ${tagName}`);
          const user =  await this.userService.findByTagName(tagName);
          if(true === this.enforceSingleClientConnection(user)){
            await this.userService.markLoggedIn(user.id);
            return user;
          } else 
            return null;
      } else return 
    } catch(err){
      throw new HttpException('Wrong credentials provided ' + err, HttpStatus.BAD_REQUEST);
    }
  }
  //Called from Auth Controller
  async getNewToken(user: any){
      return {
          refreshToken: await this.newRefreshToken(user)   
      }
  }

  async getInvites(userId: string) {
    return this.inviteService.getInvitesByUser(userId);
  }

  async getUserForTokenLogin(user: any) {
    await this.userService.markLoggedIn(user.id);
    const loggedInUser = await this.userService.findOne(user.id);
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

  public async newRefreshToken(user: any) {
    const payload: jwtPayload = { 
      username: user?.tagName, 
      sub: user?.id
    } 
    const refreshToken = this.jwtService.sign(payload, {
      secret: jwtConstants.refreshSecret,
      expiresIn: '900s'
    });
    await this.userService.setHashedRefreshToken(refreshToken, user?.id); 
    return refreshToken;
  }
}