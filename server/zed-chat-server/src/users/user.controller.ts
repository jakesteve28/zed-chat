import { HttpException, Controller, Get, Post, Param, Body, Delete, Logger, Header, Options, HttpStatus, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity'
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FriendRequest } from 'src/friendRequest/friendRequest.entity';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @Get(':id')
  @UseGuards(JwtAuthGuard)
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
@UseGuards(JwtAuthGuard)
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

  @Get()
  @UseGuards(JwtAuthGuard)
  getAllUsers(): Promise<User[]> {
    try {
      return this.userService.findAll();
    } catch(error) {

    }
  }
  @Options()
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string): Promise<string> {
    try {
      return this.userService.remove(id);
    } catch(error) {

    }
  }
}
