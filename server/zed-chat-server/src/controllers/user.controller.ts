/** 
     2021 Jacob Stevens 

     My user controller. It's for handling User CRUD operations.
     Only is really used for creating a new user on creating an account,
     might turn this into "account controller" and eliminate some exposed CRUD operations here
     Any access to user account is handled by the auth controller so...
*/

import { Controller, Get, Post, Param, Body, Header, Options, UseGuards } from '@nestjs/common';
import { UserService } from '../providers/user.service';
import { User } from '../entities/user.entity'
import { CreateUserDto } from '../entities/dto/create-user.dto';
import JwtRefreshGuard from '../guards/jwt-refresh-guard';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  /**
   * Fetches a user by their UUID
   * @param id 
   * @returns a user or null
   */
  @Get(':id')
  @UseGuards(JwtRefreshGuard)
  async getUser(@Param('id') id): Promise<User> {
    try {
      const user = await this.userService.findOne(id);
      return user;
    } catch(error) {
      console.error("Error while fetching a user"); 
      return null; 
    }
  }
  /**
   * 
   * @returns the options for this controller, GET POST OPTIONS DELETE
   */
  @Options()
  @UseGuards(JwtRefreshGuard)
  @Header('content-type', 'application/json')
  getOptions(): any {
      return this.userService.options();
  }

  /**
   * POST to create a new user
   * @param createUserDto 
   * @returns the created user minus their hashed pw
   */
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    try {
       const user = await this.userService.create(createUserDto);
       return user;
    } catch(error) {
      console.error("Error: creation of user resulted in server error. ", error);
      return null;
    }
  }
}
