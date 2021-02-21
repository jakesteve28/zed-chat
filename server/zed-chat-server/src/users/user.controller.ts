import { HttpException, Controller, Get, Post, Param, Body, Delete, Logger, Header, Options, HttpStatus, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity'
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FriendRequest } from '../friendRequest/friendRequest.entity';
import JwtRefreshGuard from '../auth/jwt-refresh-guard';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @Get(':id')
  @UseGuards(JwtRefreshGuard)
  async getUser(@Param('id') id): Promise<User> {
    try {
      const user = await this.userService.findOne(id);
      user.password = undefined; 
      return user;
    } catch(error) {
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: "User Find One Error"
      }, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  @Get('/invites/:id')
  @UseGuards(JwtRefreshGuard)
  async getUserRecInvites(@Param('id') id): Promise<FriendRequest[]> {
    try {
      return this.userService.getFriendRequests(id);
    } catch(error) {
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: "User Find One Error"
      }, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  @Options()
  @UseGuards(JwtRefreshGuard)
  @Header('content-type', 'application/json')
  getOptions(): any {
    try {
      return this.userService.options();
    } catch(error) { 
      
    }
  }
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    try {
       const user = await this.userService.create(createUserDto);
       user.password = undefined;
       return user;
    } catch(error) {
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: "User Post Error"
      }, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  @Delete(':id')
  @UseGuards(JwtRefreshGuard)
  remove(@Param('id') id: string): Promise<string> {
    try {
      return this.userService.remove(id);
    } catch(error) {

    }
  }
}
