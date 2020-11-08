import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateInviteDto } from './dto/create-invite.dto';
import { Invite } from './invite.entity';
import { InviteService } from './invite.service';

@Controller('invite')
export class InviteController {
    constructor(private inviteService: InviteService){}
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async getInvite(@Param('id') id): Promise<Invite> {
        return this.inviteService.getInvite(id);
    }
    @Get('/user/:id')
    @UseGuards(JwtAuthGuard)
    async getByUser(@Param('id') id): Promise<Invite[]> {
        return this.inviteService.getInvitesByUser(id);
    }
    @Get('/sent/:id')
    @UseGuards(JwtAuthGuard)
    async getSent(@Param('id') id): Promise<Invite[]> {
        return this.inviteService.getSentInvitesByUser(id);
    }
    @Get('/conversation/:id')
    @UseGuards(JwtAuthGuard)
    async getByConversation(@Param('id') id): Promise<Invite[]> {
        return this.inviteService.getConversationInvites(id);
    }
    @Post('create')
    @UseGuards(JwtAuthGuard)
    async create(@Body() createInviteDto: CreateInviteDto): Promise<Invite> {
        return this.inviteService.create(createInviteDto.sender, 
                                            createInviteDto.recipient, 
                                            createInviteDto.conversationId);
    }
    @Put('accept/:id')
    @UseGuards(JwtAuthGuard)
    async accept(@Param('id') id): Promise<Invite> {
        return this.inviteService.acceptInvite(id);
    }
    @Put('cancel/:id')
    @UseGuards(JwtAuthGuard)
    async cancel(@Param('id') id): Promise<Invite> {
        return this.inviteService.cancelInvite(id);
    }
}
