/**
 * 2021 Jacob Stevens 
 * Auth Service 
 * Heavy lifting class, responsible for validating hashes and signatures of tokens and passwords.
 * Also fetches accounts for logins, and wears other hats that it shouldn't. TODO.. 
 */

import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InviteService } from './invite.service';
import { User } from '../entities/user.entity';
import { jwtConstants } from '../config/constants';
import { Invite } from 'src/entities/invite.entity';

/**
 * Cohesive interface of what this jwtPayload is supposed to look like
 */
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
  /**
   * Function for making sure that the currently connecting user isn't marked as "isOnline" or "loggedIn"
   * I need a reliable "heartbeat" type disconnect for logging out users first, 
   * or just checking their current cookie expiration timestamp should they a disconnected socket. TODO...
   * @param user the user we're ensuring isn't logging in twice 
   * @returns true if the User is marked as logged out and offline.
   */
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
  /**
   * Called from LocalAuthGuard, this method ensures that the user is okay to login. 
   * Also checks their hashed pw with bcrypt
   * @param tagName the user's tagname
   * @param pass submitted pw from the client 
   * @returns the user if all valid, null if not
   */
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
  /**
   * Creates a new token with a new expiration time.
   * @param user The user that needs a new token
   * @returns { refreshToken: Thetoken }
   */
  async getNewToken(user: any){
      return {
          refreshToken: await this.newRefreshToken(user)
      }
  }

  /**
   * Returns a user's invites. Selects where the invite's recipient ID is the passed userId
   * @param userId uhhh
   * @returns an array of invites
   */
  async getInvites(userId: string): Promise<Invite[]> {
    return this.inviteService.getInvitesByUser(userId);
  }

  /**
   * Fetches the user, a limited number of messages from all their conversations, and all their invites 
   * @param user the user that we need to get all their messages/invites from
   * @returns object with all that I just typed
   */
  async getUserForTokenLogin(user: any) {
    await this.userService.markLoggedIn(user.id);
    const loggedInUser = await this.userService.findOne(user.id);
      return {
        user: loggedInUser,
        invites: await this.inviteService.getInvitesByUser(user.id),
        id: user.id
    }
  }

  /**
   * Marks the user as logged out in the database
   * @param user user from req.user
   * @returns true if the update was succesful, false if not
   */
  async logout(user: any) {
    const _user = await this.userService.logout(user.id); 
    if(_user) {
      console.log(`User @${_user.tagName} logged out`);
      return true; 
    }
    return false;
  }

  /**
   * Generates a new refresh token and returns it. Also sets the new token in the database for the given user
   * @param user the user to generate a new token for
   * @returns the new refresh token, a JWT.
   */
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