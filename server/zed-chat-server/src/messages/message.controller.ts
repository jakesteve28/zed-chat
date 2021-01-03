import { Body, Controller, Delete, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './message.entity';
import { MessageService } from './message.service';

@Controller('message')
export class MessageController {
    constructor(private messageService: MessageService){}
    @Post('create')
    @UseGuards(JwtAuthGuard)
    async create(@Body() createMessageDto: CreateMessageDto): Promise<Message> {
        return await this.messageService.create(createMessageDto);
    }
    @Delete('remove')
    @UseGuards(JwtAuthGuard)
    async remove(@Body('messageId') messageId): Promise<string> {
        return await this.messageService.remove(messageId);
    }
}
