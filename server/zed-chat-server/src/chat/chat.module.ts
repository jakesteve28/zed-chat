import { ConversationModule } from 'src/conversations/conversation.module';
import { ChatGateway } from './chat.gateway';
import { UserModule } from '../users/user.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/constants';
import { MessageModule } from 'src/messages/message.module';

@Module({
    imports: [UserModule,
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: {expiresIn: '24h'}
        }),
        ConversationModule,
        MessageModule
    ],
    providers: [ChatGateway],
    exports: [ChatGateway]
})
export class ChatModule {}
  