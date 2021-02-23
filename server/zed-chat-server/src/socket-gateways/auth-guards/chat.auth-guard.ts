import { CanActivate, Injectable } from "@nestjs/common";
import { UserService } from "../../users/user.service";
import { JwtService } from '@nestjs/jwt'
import { ConversationService } from "../../conversations/conversation.service";
import { User } from "../../users/user.entity";
import extractRefreshTokenFromCookie from "./auth-guard.util";
import { jwtConstants } from "../../auth/constants";

@Injectable()
export class ChatGuard implements CanActivate {
  constructor(private userService: UserService, private jwtService: JwtService,
  private conversationService: ConversationService) { }
  async canActivate(context: any): Promise<any> {
    if(!context || context.contextType !== 'ws') throw `Context type of ${context.contextType} not allowed`;
    try {
      const user = await this.verifyJwt(context);
      if(!user) { 
        return false;
      }
      const userValid = this.checkUser(user); 
      if(userValid === true) {
        const result = await this.classify(context, user);
        return result; 
      }
    } catch(err) {
      console.error("Fatal Error in ChatGuard. Request blocked.");
      return false;
    } 
  }
  verifyJwt(context: any): Promise<User> {
    const refreshToken = extractRefreshTokenFromCookie(context.args[0]?.handshake?.headers?.cookie);
    if(!refreshToken) {
      console.error("Error: ChatGuard | No refresh token included in request!");
      return null;
    }
    const decoded = this.jwtService.verify(refreshToken,{ secret: jwtConstants.refreshSecret });
    if((decoded?.exp * 1000)  - Date.now() <= 0) {
      console.error("Error: ChatGuard | JWT expiration time error");
      return null;
    }
    console.log(`ChatGuard JWT verified successfully: Cookie/JWT Token Expires: ${decoded?.exp * 1000} | Now: ${Date.now()} | Diff: ${(decoded?.exp * 1000) - Date.now()}`);
    const user = this.userService.findByTagName(decoded?.username);
    return user;
  }
  checkUser(user: User): Boolean {
    if(user.flagged === true) {
      console.error(`Error: User @${user.tagName} failed ChatGuard. User is marked as flagged for suspicious activity`); 
      return false;
    }
    if(user.disabled === true) {
      console.error(`Error: User @${user.tagName} failed ChatGuard. User is marked as disabled`); 
      return false;
    }
    return true;
  }

  async classify(context: any, user: User): Promise<Boolean> {
    // { 
    //    sender: string (tagName) 
    // }
    if(context.args[1].body && context.args[1].sender && context.args[1].room){
        const conversation = await this.conversationService.findOne(context.args[1].room);
        if(conversation.users.filter(_user => _user.id === user.id).length === 0){ console.log("Error: User doesn't exist in this conversation, cannot accept notification from them. Conversation ID: " + conversation.id)};
        // ^^ Iterates users in the conv, making sure requesting user is a member of the conversation
        console.log(`Success: ChatGuard passed for new message with sender @${user.tagName}> with conversation ID ${conversation.id}`);
        return context.args[1].sender === user.tagName;
    } 
    // {
    //   refresh: true,
    //   userId: String
    // }
    if(context.args[1].userId && context.args[1].refresh === true){
      console.log(`Success: ChatGuard passed for refresh chat socket ID for user ID ${context.args[1].userId}`);
      return true;
    }
    // {
    //   user: {User},
    //   conversationId: String
    // }
    if(context.args[1].user && context.args[1].conversationId) {
      console.log(`Success: ChatGuard passed for setting current conversation to ID ${context.args[1].conversationId} for user @${context.args[1].user.tagName}`); 
      return true;
    }
    // {
    //   sender: account.tagName, 
    //   room: currConvid, 
    //   typing : bool
    // }
    if(context.args[1].sender && context.args[1].room) {
      console.log(`Success: ChatGuard passed for typing on current conversation to ID ${context.args[1].room} for user @${context.args[1].sender}`); 
      return true;
    }
    return false;
  }
}