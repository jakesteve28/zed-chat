import { HttpException, Controller, Get, Post, Param, Body, Delete, Logger, Header, Options, HttpStatus, UseGuards, Request, Put } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { Conversation } from './conversation.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Message } from 'src/messages/message.entity';

@Controller('conversation')
export class ConversationController {
  constructor(private conversationService: ConversationService) {}
  @Get(':id')
  async getUser(@Param('id') id): Promise<Conversation> {
    try {
      return this.conversationService.findOne(id);
    } catch(error) {
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: "Conversation Find One Error"
      }, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createConversation(@Body('tagName') tagName: string): Promise<Conversation> {
    return this.conversationService.create(tagName)
  }
  @Delete('remove')
  @UseGuards(JwtAuthGuard)
  async removeConversation(@Body('conversationId') conversationId): Promise<string> {
      return this.conversationService.remove(conversationId);
  }
  @Put('addUser')
  @UseGuards(JwtAuthGuard)
  async addUser(@Request() req, @Body('conversationId') conversationId, @Body('userTagName') userTagName): Promise<Conversation> {
    return this.conversationService.addUser(conversationId, userTagName);
  }
  @Put('removeUser')
  @UseGuards(JwtAuthGuard)
  async removeUser(@Body('conversationId') conversationId, @Body('userTagName') userTagName): Promise<Conversation> {
    return this.conversationService.removeUser(conversationId, userTagName);
  }
  @Options('options')
  @UseGuards(JwtAuthGuard)
  async options(){
      return this.conversationService.options()
  }
  @Get('/messages/:id')
  @UseGuards(JwtAuthGuard)
  async getMessages(@Param('id') conversationId): Promise<Message[]> {
    return this.conversationService.getMessages(conversationId)
  }
}
