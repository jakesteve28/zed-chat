/**
 * 2021 Jacob Stevens 
 * Authentication wrapper for the local strategy. Allows for the UseGuard decorator to be used on controller methods. 
 */

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}