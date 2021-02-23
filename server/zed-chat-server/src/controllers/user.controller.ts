import { HttpException, Controller, Get, Post, Param, Body, Delete, Header, Options, HttpStatus, UseGuards } from '@nestjs/common';
import { UserService } from '../providers/user.service';
import { User } from '../entities/user.entity'
import { CreateUserDto } from '../entities/dto/create-user.dto';
import { FriendRequest } from '../entities/friendrequest.entity';
import JwtRefreshGuard from '../guards/jwt-refresh-guard';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @Get(':id')
  @UseGuards(JwtRefreshGuard)
  async getUser(@Param('id') id): Promise<User> {
    try {
      const user = await this.userService.findOne(id);
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
      return this.userService.options();
  }
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    try {
       const user = await this.userService.create(createUserDto);
       return user;
    } catch(error) {
      console.error("Error: creation of user resulted in fatal server error. ", error);
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: "User Creation Error" + error
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Delete(':id')
  @UseGuards(JwtRefreshGuard)
  remove(@Param('id') id: string): Promise<string> {
    return this.userService.remove(id);
  }
}
