import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm'; 
import { Connection } from 'typeorm'
import { UserModule } from './users/user.module';
import { AuthModule } from './auth/auth.module'
import { ConversationModule } from './conversations/conversation.module'
import { InviteModule } from './invites/invite.module';
import { MessageModule } from './messages/message.module';
import { ConfigModule } from '@nestjs/config';
import { SocketGatewayModule } from './socket-gateways/socket-gateway.module';
import { FriendRequestModule } from './friendRequest/friendRequest.module';
import { User } from './users/user.entity';
import { Message } from './messages/message.entity';
import { Invite } from './invites/invite.entity';
import { FriendRequest } from './friendRequest/friendRequest.entity';
import { Conversation } from './conversations/conversation.entity';
import { StorageModule } from './storage/storage.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

export const options: TypeOrmModuleOptions = {
  type: "mysql",
  host: "hcm4e9frmbwfez47.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
  port: 3306,
  username: "kug2zfxokj8n4t2j",
  password: "ebogm84ggoq34204",
  database: "elokhe5atpjpk6zz",
  synchronize: true,
  entities: [User, Message, Invite, FriendRequest, Conversation]
}

export const optionsDev: TypeOrmModuleOptions = {
  type: "mysql",
  host: "mysql",
  port: 3306,
  username: "root",
  password: "root",
  database: "zed-chat",
  synchronize: true,
  entities: [User, Message, Invite, FriendRequest, Conversation]
}

@Module({
  imports: [
    TypeOrmModule.forRoot(options), 
    UserModule, 
    AuthModule, 
    ConversationModule,  
    InviteModule, 
    MessageModule, 
    ConfigModule.forRoot({
      isGlobal: true,
    }), 
    SocketGatewayModule, 
    FriendRequestModule,
    StorageModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'static'),
      exclude: ['/client**']
    })
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {
}
