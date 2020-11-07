import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { LocalAuthGuard } from './auth/local-auth.guard'
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { Connection } from 'typeorm';
import { Header } from '@nestjs/common/decorators/http/header.decorator';

@Controller()
export class AppController {
  constructor(private connection: Connection, private appService: AppService, private authService: AuthService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }
  // @Get('cleardb')
  // async clear(): Promise<string> {
  //   const entities = this.connection.entityMetadatas;
  //   for (const entity of entities) {
  //     console.log(entity.name)
  //     if(entity.name === 'user_conversations_conversation'){
  //       const repository = await this.connection.getRepository(entity.name); // Get repository
  //       await repository.query(`TRUNCATE TABLE \`${entity.tableName}\`;`); // Clear each entity table's content
  //     }
  //     if(entity.name === 'User'){
  //       const repository = await this.connection.getRepository(entity.name); // Get repository
  //       await repository.query(`TRUNCATE TABLE \`${entity.tableName}\`;`); // Clear each entity table's content
  //     }
  //   }
  //   return 'success'
  // }

  @UseGuards(LocalAuthGuard)
  @Header('Access-Control-Allow-Origin', '*')
  @Post('auth/login')
  async login(@Request() req) {
     return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
