import { Controller, Get, Request, Res, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { Connection } from 'typeorm';
import { Response } from 'express';
import { join } from 'path';
import JwtRefreshGuard from './auth/jwt-refresh-guard';
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
 
  @UseGuards(JwtRefreshGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
