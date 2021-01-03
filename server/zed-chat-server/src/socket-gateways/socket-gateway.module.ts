import { ConversationModule } from '../conversations/conversation.module';
import { ChatGateway } from './chat.gateway';
import { UserModule } from '../users/user.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/constants';
import { MessageModule } from '../messages/message.module';
import { NotificationsGateway } from './notification.gateway';
import { InviteModule } from '../invites/invite.module';
import { FriendRequestModule } from '../friendRequest/friendRequest.module';

@Module({
    imports: [
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: {expiresIn: '24h'}
        }),
        UserModule,
        ConversationModule,
        MessageModule,
        InviteModule,
        FriendRequestModule
    ],
    providers: [ChatGateway, NotificationsGateway],
    exports: [ChatGateway, NotificationsGateway, UserModule]
})
export class SocketGatewayModule {}
  