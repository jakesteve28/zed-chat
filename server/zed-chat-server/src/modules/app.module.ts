import { Module } from '@nestjs/common';
import { AppController } from '../controllers/app.controller';
import { AppService } from '../providers/app.service';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm'; 
import { UserModule } from './user.module';
import { AuthModule } from './auth.module'
import { ConversationModule } from './conversation.module'
import { InviteModule } from './invite.module';
import { MessageModule } from './message.module';
import { ConfigModule } from '@nestjs/config';
import { SocketGatewayModule } from './socket-gateway.module';
import { FriendRequestModule } from './friendRequest.module';
import { User } from '../entities/user.entity';
import { Message } from '../entities/message.entity';
import { Invite } from '../entities/invite.entity';
import { FriendRequest } from '../entities/friendRequest.entity';
import { Conversation } from '../entities/conversation.entity';
import { StorageModule } from './storage.module';
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
