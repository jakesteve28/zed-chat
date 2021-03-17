/**
 * 2021 Jacob Stevens
 * Wrapper for the jwt refresh strategy. 
 * Makes the strategy pluggable to gateway message handlers with the UseGuards decorator. 
 */

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
 
@Injectable()
export default class JwtRefreshGuard extends AuthGuard('jwt') {}