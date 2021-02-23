import { HttpException, Controller, Get, Post, Param, Body, Delete, Options, HttpStatus, UseGuards, Request, Put, Query } from '@nestjs/common';
import { ConversationService } from '../providers/conversation.service';
import { Conversation } from '../entities/conversation.entity';
import { Message } from '../entities/message.entity';
import JwtRefreshGuard from '../guards/jwt-refresh-guard';

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
        error: "Conversation Find One Error" + error
      }, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  @Post('create')
  @UseGuards(JwtRefreshGuard)
  async createConversation(@Body('tagName') tagName: string, @Body('conversationName') conversationName: string): Promise<Conversation> {
    return this.conversationService.create(tagName, conversationName);
  }
  @Delete('remove')
  @UseGuards(JwtRefreshGuard)
  async removeConversation(@Body('conversationId') conversationId): Promise<string> {
      return this.conversationService.remove(conversationId);
  }
  @Put('addUser')
  @UseGuards(JwtRefreshGuard)
  async addUser(@Request() req, @Body('conversationId') conversationId, @Body('userTagName') userTagName): Promise<Conversation> {
    return this.conversationService.addUser(conversationId, userTagName);
  }
  @Put('removeUser')
  @UseGuards(JwtRefreshGuard)
  async removeUser(@Body('conversationId') conversationId, @Body('userTagName') userTagName): Promise<Conversation> {
    return this.conversationService.removeUser(conversationId, userTagName);
  }
  @Options('options')
  @UseGuards(JwtRefreshGuard)
  async options(){
      return this.conversationService.options()
  }
  @Get('/messages/truncated/:id')
  @UseGuards(JwtRefreshGuard)
  async getMessages(@Param('id') conversationId): Promise<Message[]> {
    return this.conversationService.getMessagesTruncated(conversationId)
  }
  @Get('/messages/range')
  @UseGuards(JwtRefreshGuard)
  async getMessagesRange(@Query('id') conversationId, @Query('beforeDate') beforeDate, @Query('number') number): Promise<Message[]> {
    let accum = 0;
    const max = parseInt(number); 
    const dateBefore = new Date(beforeDate).getTime();
    const { messages } = await this.conversationService.findOne(conversationId); 
    const messagesRet = messages.filter(message => (++accum <= max) && new Date(message.createdAt).getTime() < dateBefore);
    return messagesRet;  
  }
}
