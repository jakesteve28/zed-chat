import { Controller, Get, Post, Request, Res, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { LocalAuthGuard } from './auth/local-auth.guard'
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { Connection } from 'typeorm';
import { Header } from '@nestjs/common/decorators/http/header.decorator';
import { Response } from 'express';
@Controller()
export class AppController {
  constructor(private connection: Connection, private appService: AppService, private authService: AuthService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }
  @UseGuards(LocalAuthGuard)
  @Header('Access-Control-Allow-Origin', 'localhost:3003')
  @Post('auth/login')
  async login(@Request() req, @Res({ passthrough: true }) response: Response) {
     const { user, id, invites, token } = await this.authService.login(req.user);
     response.cookie('token', token, { maxAge: 900000, httpOnly: true }); 
     return { user, id, invites }; 
  }

  @Get('/refreshToken')
  async refreshToken(@Request() req, @Res({ passthrough: true }) response: Response) {
    const { user, id, invites, token } = await this.authService.login(req.user);
    response.cookie('token', token, { maxAge: 900000, httpOnly: true }); 
    return { user, id, invites }; 
 }
 
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
