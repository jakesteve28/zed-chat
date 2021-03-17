/**
 * 2021 Jacob Stevens
 * Message Module
 * Pretty self explanatory. Read auth.module notes for forwardRef imports
 */

import { ConversationModule } from './conversation.module';
import { ChatGateway } from '../gateways/chat.gateway';
import { UserModule } from './user.module';
import { Module } from '@nestjs/common';
import { MessageModule } from './message.module';
import { NotificationsGateway } from '../gateways/notification.gateway';
import { InviteModule } from './invite.module';
import { FriendRequestModule } from './friendRequest.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../config/constants';

@Module({
    imports: [
        UserModule,
        ConversationModule,
        MessageModule,
        InviteModule,
        FriendRequestModule,
        JwtModule.register({
            secret: jwtConstants.refreshSecret
        })
    ],
    providers: [ChatGateway, NotificationsGateway],
    exports: [ChatGateway, NotificationsGateway, UserModule]
})
export class SocketGatewayModule {}
  