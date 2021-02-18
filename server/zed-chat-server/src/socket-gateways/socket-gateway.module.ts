import { ConversationModule } from '../conversations/conversation.module';
import { ChatGateway } from './chat.gateway';
import { UserModule } from '../users/user.module';
import { Module } from '@nestjs/common';
import { MessageModule } from '../messages/message.module';
import { NotificationsGateway } from './notification.gateway';
import { InviteModule } from '../invites/invite.module';
import { FriendRequestModule } from '../friendRequest/friendRequest.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/constants';

@Module({
    imports: [
        UserModule,
        ConversationModule,
        MessageModule,
        InviteModule,
        FriendRequestModule,
        JwtModule.register({
            secret: jwtConstants.accessSecret
        })
    ],
    providers: [ChatGateway, NotificationsGateway],
    exports: [ChatGateway, NotificationsGateway, UserModule]
})
export class SocketGatewayModule {}
  