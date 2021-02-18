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
        const accessTokenCookie = this.authService.accessToken(request.user);
        res.cookie('Authentication', accessTokenCookie, { maxAge: 900000, httpOnly: true })
        //request.res.setHeader('Set-Cookie', accessTokenCookie);
        return request.user;
    }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Req() req, @Res() res: Response) {
        const { user, id, invites, accessToken, refreshToken } = await this.authService.login(req.user);
        //req.res.setHeader('Set-Cookie', [accessToken, refreshToken]); 
        res.cookie('Authentication', accessToken, { maxAge: 900000, httpOnly: true })
        res.cookie('Refresh', refreshToken,  { maxAge: 900000, httpOnly: true });
        return res.send({ user, id, invites })
        //return { user, id, invites }; 
    }
}