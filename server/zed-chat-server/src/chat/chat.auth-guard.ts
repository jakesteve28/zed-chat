import { CanActivate, Injectable } from "@nestjs/common";
import { UserService } from "src/users/user.service";
import { JwtService } from '@nestjs/jwt'
import { Conversation } from "src/conversations/conversation.entity";
import { ConversationService } from "src/conversations/conversation.service";
import { User } from "src/users/user.entity";

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
        const msg = JSON.parse(context.args[1])
        if(msg){
          if(msg.room && msg.room !== undefined){
            const conversation = await this.conversationService.findOne(msg.room);
            this.messageHelper(context, conversation, user)
            console.log(`User: <${user.tagName}> | Conversation: <${conversation.id}>` )
            //console.log("Connection to socket conversation room <" + msg.room + "> allowed for user <" + user.tagName + ">")
            return true
          }
        }
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