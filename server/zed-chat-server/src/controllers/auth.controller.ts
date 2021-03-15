/** 
    2021 Jacob Stevens 
    My authorization controller. 
    Verifies passwords/logins, 
    dishes out JWTs for auth in a refresh cookie, 
    and has a "logout" route for users to mark their statuses properly
*/
import { Req, Controller, UseGuards, Get, Res, Post } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from '../providers/auth.service';
import JwtRefreshGuard from '../guards/jwt-refresh-guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
@Controller('auth')
export class AuthController {
constructor(
    private readonly authService: AuthService,
) {}
    /**
     * Refresh route is called from the client so the user's current jwt refresh token doesn't expire
     * @param request The guard attaches "user" object to request object, we need it in the response 
     * @param res Default express res object used for sending the response w/ cookie 
     */
    @UseGuards(JwtRefreshGuard)
    @Get('refresh')
    refresh(@Req() request: Request, @Res() res: Response) {
        const accessTokenCookie = this.authService.newRefreshToken(request.user);
        res.cookie('Refresh', accessTokenCookie, { maxAge: 900000, httpOnly: true });
        return res.send({ successful: true, user: request.user });
    }

    /**
     * Login route called from client. Logins the user w/ the user service, dishes them a jwt in a cookie
     * @param req The guard attaches "user" object to request object, we need it for the login service
     * @param res Default express res object used for sending the response w/ cookie 
     */
    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Req() req, @Res() res: Response) {
        const refreshToken = await this.authService.newRefreshToken(req.user);
        const invites = await this.authService.getInvites(req.user.id);
        const user = await this.authService.getUserForTokenLogin(req.user);
        res.cookie('Refresh', refreshToken,  { maxAge: 900000, httpOnly: true });
        return res.send({ user: user, 
            id: req.user.id, 
            invites: invites, 
            refreshToken: true });
    }

    /**
     * Route for when user has token, isn't logged in, but needs all their application data 
     * @param req The guard attaches "user" object to request object, we need it for the login/fetch account service
     * @param res Default express res object used for sending the response w/ all the users needed info
     */
    @UseGuards(JwtRefreshGuard)
    @Get('refreshAccount')
    async refreshAccount(@Req() req: Request, @Res() res: Response) {
        console.log("Attemping login using token!"); 
        const { user, id, invites } = await this.authService.getUserForTokenLogin(req.user);
        return res.send({user: user, id: id, invites: invites, refreshToken: true }); 
    }

    /**
     * Logout route clears cookies and uses a service to mark the user
     * @param req  The guard attaches "user" object to request object, we need it for the logout service
     * @param res  Default express res object used for clearing cookies
     */
    @UseGuards(JwtRefreshGuard)
    @Get('logout')
    async logoutAccount(@Req() req, @Res() res: Response) {
        console.log("Logging out user account @" + req.user.tagName);        
        const success = await this.authService.logout(req.user);
        res.clearCookie('Refresh');
        if(success) res.send({ success: true });
        else res.status(500).send("Error logging out");
    }
}