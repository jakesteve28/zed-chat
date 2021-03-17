/** 
    2021 Jacob Stevens 

    My "chat" (conversation) controller. Notice my bad naming convention there... TODO
    CRUDs for conversations, their users, and fetching associated messages
    Probably don't need this controller, since most of the operations for CRUD is 
    performed from the chatsocket/chatgateway...  
*/

import { Controller, Get, Post, Param, Body, Delete, Options, UseGuards, Req, Put, Query } from '@nestjs/common';
import { ConversationService } from '../providers/conversation.service';
import { Conversation } from '../entities/conversation.entity';
import { Message } from '../entities/message.entity';
import JwtRefreshGuard from '../guards/jwt-refresh-guard';

@Controller('conversation')
export class ConversationController {
  constructor(private conversationService: ConversationService) {}

  /**
   * Gets the conversation by their ID or just returns null
   * req.user must be in the conv
   * @param id the uuidv4 of the conv
   */
  @Get(':id')
  @UseGuards(JwtRefreshGuard)
  async getUser(@Req() req, @Param('id') id): Promise<Conversation> {
    try {
      const conversation = await this.conversationService.findOne(id);
      if(conversation.users.some(user => user.id === req.user.id)){
          return conversation;
      } else {
        return null;
      }
    } catch(error) {
      return null;
    }
  }

  /**
   * Creates a new conversation with a tagname and a conversationName in the req body... or returns null if failed
   * @param req for the req.user object 
   * @param conversationName some good name... Probably need to intercept/validate this input
   */
  @Post('create')
  @UseGuards(JwtRefreshGuard)
  async createConversation(@Req() req, @Body('conversationName') conversationName: string): Promise<Conversation> {
    if(req.user?.tagName){
      return this.conversationService.create(req.user.tagName, conversationName);
    } else return null;
  }

  /**
   * Removes a conversation if the requesting user is a participant. Anyone can delete it all/walk out whenever
   * @param req for the req.user object 
   * @param conversationId <- 
   */
  @Delete('remove')
  @UseGuards(JwtRefreshGuard)
  async removeConversation(@Req() req, @Body('conversationId') conversationId): Promise<string> {
    if(req.user?.id){
        return this.conversationService.remove(conversationId);
    } else return null;
  }

  /**
   * Adds a user to the conversation and returns it or returns null
   * @param req for the req.user object 
   * @param conversationId <-
   */
  @Put('addUser')
  @UseGuards(JwtRefreshGuard)
  async addUser(@Req() req, @Body('conversationId') conversationId): Promise<Conversation> {
    if(req.user?.tagName){
      return this.conversationService.addUser(conversationId, req.user.tagName);
    } else return null;
  }

  /**
   * Gives back the allowed options for this controller. No guard used, requestable by all.
   */
  @Options('options')
  async options(){
      return this.conversationService.options()
  }

  /**
   * Returns a list of the most recent 25 messages, if the requester is part of that conversation. 
   * @param conversationId <-
   */
  @Get('/messages/truncated/:id')
  @UseGuards(JwtRefreshGuard)
  async getMessages(@Req() req, @Param('id') conversationId): Promise<Message[]> {
    if(req.user?.id){
      return this.conversationService.getMessagesTruncated(req.user.id, conversationId);
    } return null;
  }

  /**
   * Returns a range of messages. No limit to the amount.
   * @param conversationId <-
   * @param beforeDate 
   * @param number 
   */
  @Get('/messages/range')
  @UseGuards(JwtRefreshGuard)
  async getMessagesRange(@Req() req, @Query('id') conversationId, @Query('beforeDate') beforeDate, @Query('number') number): Promise<Message[]> {
    let accum = 0;
    const max = parseInt(number); 
    const dateBefore = new Date(beforeDate).getTime();
    const { messages } = await this.conversationService.findOne(conversationId); 
    const messagesRet = messages.filter(message => (++accum <= max) && new Date(message.createdAt).getTime() < dateBefore);
    return messagesRet;  
  }
}
