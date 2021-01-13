import { CanActivate, Injectable } from "@nestjs/common";
import { UserService } from "../../users/user.service";
import { JwtService } from '@nestjs/jwt'
import { Conversation } from "../../conversations/conversation.entity";
import { ConversationService } from "../../conversations/conversation.service";
import { User } from "../../users/user.entity";

@Injectable()
export class ChatGuard implements CanActivate {
  constructor(private userService: UserService, private jwtService: JwtService,
    private conversationService: ConversationService) {
  }
  async canActivate(context: any): Promise<any> {
    if(!context || context.contextType !== 'ws') throw `Context type of ${context.contextType} not allowed`
    try {
      const bearerToken = context.args[0].handshake.headers.authorization.split(' ')[1];
      const decoded = this.jwtService.verify(bearerToken) as any;
      const user = await this.userService.findByTagName(decoded.username)
      try {
        if(typeof context.args[1] === 'string'){
          const msg = JSON.parse(context.args[1])
          if(msg){
            if(msg.room && msg.room !== undefined){
              const conversation = await this.conversationService.findOne(msg.room);
              this.messageHelper(context, conversation, user)
              console.log(`User: <${user.tagName}> | Conversation: <${conversation.id}>` )
              //console.log("Connection to socket conversation room <" + msg.room + "> allowed for user <" + user.tagName + ">")
              return true;
            }
          }
        }
        if(context.args[1].room){
          const conversation = await this.conversationService.findOne(context.args[1].room);
          if(conversation.users.filter(_user => _user.id === user.id).length === 0){ console.log("Error: User doesn't exist in this conversation, cannot accept notification from them. Conversation ID: " + conversation.id)};
          // ^^ Iterates users in the conv, making sure requesting user is a member of the conversation
          this.messageHelper(context, conversation, user)
          console.log(`User: <${user.tagName}> | Conversation: <${conversation.id}>` )
          //console.log("Connection to socket conversation room <" + msg.room + "> allowed for user <" + user.tagName + ">")
          return true;
        } 
        console.log(context.args[1]);
        if(context.args[1].userId && context.args[1].refresh === true){
          console.log("Guard passed for chat socket ID");
          console.log(context.args[1]);
          return true;
        }
        return false;
      } catch(err) {
        const msg = context.args[1] || undefined
        if(msg){
          let uuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(msg);
          if(uuid === true){
            const conversation = await this.conversationService.findOne(msg);
            this.messageHelper(context, conversation, user)
              console.log("Connection to socket conversation room <" + msg+ "> allowed for user <" + user.tagName + ">")
              return true
          }
        }
        return false;
      } 
    } catch (ex) {
      console.log(ex)
      return false;
    }
  }
  messageHelper(context: any, conversation: Conversation, user: User){
    if(!conversation) throw `Error: conversation ${context.args[1]} does not exist`
    if(!user) throw "Error: user does not exist" 
    if(!conversation) throw `Error: conversation ${context.args[1]} does not exist`
    if(!user) throw "Error: user does not exist" 
  }
}