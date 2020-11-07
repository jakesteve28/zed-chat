import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { Connection } from 'typeorm'
import { UserModule } from './users/user.module';
import { AuthModule } from './auth/auth.module'
import { ConversationModule } from './conversations/conversation.module'
import { ChatGateway } from './chat/chat.gateway';
import { ChatModule } from './chat/chat.module';
import { InviteModule } from './invites/invite.module';
import { User } from './users/user.entity';
import { MessageModule } from './messages/message.module';

@Module({
  imports: [TypeOrmModule.forRoot({
  }), UserModule, AuthModule, ConversationModule, ChatModule, InviteModule, MessageModule, InviteModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {
  constructor(private readonly connection: Connection){}
}
