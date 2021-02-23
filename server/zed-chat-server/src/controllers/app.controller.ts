import { Controller, Get, Request, Res, UseGuards } from '@nestjs/common';
import { AppService } from '../providers/app.service';
import JwtRefreshGuard from '../guards/jwt-refresh-guard';
@Controller()
export class AppController {
  constructor(
    private appService: AppService) {}
  @Get()
  getHello(): string {
    return this.appService.getHello()
  }
}
