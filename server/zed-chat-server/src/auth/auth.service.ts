import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { UserService } from '../users/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

export interface jwtPayload {
   username: string,
   sub: string 
}

@Injectable()
export class AuthService {
  constructor(
      @Inject(forwardRef(() => UserService)) 
      private userService: UserService, 
      private jwtService: JwtService
    ) 
  {}
  async validateUser(tagName: string, pass: string): Promise<any> {
    try 
    {
    const user = await this.userService.findByTagName(tagName);
    if(!user){
      throw "User not found"
    }
    console.log(user)
      const passwordMatching = await bcrypt.compare(
          pass,
          user.password
      )
      if (passwordMatching === true) {
        const { ...result } = user;
        result.password = undefined;
        return result;
      }
  } catch(err){
    throw new HttpException('Wrong credentials provided ' + err, HttpStatus.BAD_REQUEST);
}
  }
  async login(user: any){
      const payload: jwtPayload = { username: user.tagName, sub: user.id }
      return {
          access_token: this.jwtService.sign(payload),
          id: user.id
      }
  }
}