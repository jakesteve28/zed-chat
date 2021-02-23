import {
    Req,
    Controller,
    UseGuards,
    Get, 
    Res,
    Post
  } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from '../providers/auth.service';
import JwtRefreshGuard from '../guards/jwt-refresh-guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
@Controller('auth')
export class AuthController {
constructor(
    private readonly authService: AuthService,
) {}
    @UseGuards(JwtRefreshGuard)
    @Get('refresh')
    refresh(@Req() request: Request, @Res() res: Response) {
        const accessTokenCookie = this.authService.newRefreshToken(request.user);
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
        console.log("Attemping login using token!"); 
        const { user, id, invites } = await this.authService.getUserForTokenLogin(req.user);
        return res.send({user, id, invites, refreshToken: true }); 
    }

    @UseGuards(JwtRefreshGuard)
    @Get('logout')
    async logoutAccount(@Req() req: Request, @Res() res: Response) {
        console.log("Logging out user account " + req.user);        
        const success = await this.authService.logout(req.user);
        res.clearCookie('Refresh');
        if(success) res.send({ success: true });
        else res.status(500).send("Error logging out");
    }
}