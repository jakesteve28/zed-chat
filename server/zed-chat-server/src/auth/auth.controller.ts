import {
    Req,
    Controller,
    UseGuards,
    Get, 
    ClassSerializerInterceptor,
    UseInterceptors, 
    Res,
    Header,
    Post
  } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import JwtRefreshGuard from './jwt-refresh-guard';
import { LocalAuthGuard } from './local-auth.guard';
@Controller('auth')
export class AuthController {
constructor(
    private readonly authService: AuthService,
) {}

    @UseGuards(JwtRefreshGuard)
    @Get('refresh')
    refresh(@Req() request: Request, @Res() res: Response) {
        const accessTokenCookie = this.authService.refreshToken(request.user);
        res.cookie('Refresh', accessTokenCookie, { maxAge: 900000, httpOnly: true })
        return res.send({ successful: true, user: request.user });
    }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Req() req, @Res() res: Response) {
        const { user, id, invites, refreshToken } = await this.authService.login(req.user);
        res.cookie('Refresh', refreshToken,  { maxAge: 900000, httpOnly: true });
        return res.send({ user, id, invites, refreshToken: true });
    }

    @UseGuards(JwtRefreshGuard)
    @Get('refreshAccount')
    async refreshAccount(@Req() req: Request, @Res() res: Response) {
        console.log("Logging in using token!"); 
        const { user, id, invites } = await this.authService.getUserForTokenLogin(req.user);
        return res.send({user, id, invites, refreshToken: true }); 
    }
}