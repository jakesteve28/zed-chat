import { HttpException, Controller, Get, Post, Param, Body, Delete, Logger, Header, Options, HttpStatus, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity'
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getUser(@Param('id') id): Promise<User> {
    try {
      return this.userService.findOne(id);
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
       return this.userService.create(createUserDto);
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
