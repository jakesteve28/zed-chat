import { Controller, Get, Next, Post, Request, Res, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { LocalAuthGuard } from './auth/local-auth.guard'
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { Connection } from 'typeorm';
import { Header } from '@nestjs/common/decorators/http/header.decorator';
import { Response } from 'express';
import { join } from 'path';
@Controller()
export class AppController {
  constructor(
    private connection: Connection, 
    private appService: AppService, 
    private authService: AuthService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }
  
  @Get('client**')
  getClient(@Res() res: Response) {
    return res.sendFile(join(__dirname, '..', 'client/build/index.html')); 
  }
 
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
