import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { UserModule } from './user.module';
import { AuthModule } from './auth.module'
import { ConversationModule } from './conversation.module'
import { InviteModule } from './invite.module';
import { MessageModule } from './message.module';
import { ConfigModule } from '@nestjs/config';
import { SocketGatewayModule } from './socket-gateway.module';
import { FriendRequestModule } from './friendRequest.module';
import { StorageModule } from './storage.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { options } from '../config/constants';

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
      rootPath: join(__dirname, '..', '..', 'static')
    })
  ]
})
export class AppModule {
}
