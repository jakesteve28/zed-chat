import { ConversationModule } from 'src/conversations/conversation.module';
import { UserModule } from '../users/user.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/constants';
import { MessageModule } from 'src/messages/message.module';
import { InviteService } from 'src/invites/invite.service';

@Module({
    imports: [UserModule,
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: {expiresIn: '24h'}
        }),
        ConversationModule
    ],
    providers: [InviteService]
})
export class InviteModule {}
  