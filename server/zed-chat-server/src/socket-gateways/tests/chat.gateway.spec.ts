import { Test } from '@nestjs/testing';
// import { ConversationService } from '../../conversations/conversation.service';
// import { MessageService } from '../../messages/message.service';
// import { UserService } from '../../users/user.service';
import { ChatGateway } from '../chat.gateway';
describe('ChatGateway', () => {
    let gateway: ChatGateway;
    // let userService: UserService;
    // let messageService: MessageService;
    // let conversationService: ConversationService;
    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [ChatGateway]
        }).compile();
        gateway = moduleRef.get<ChatGateway>(ChatGateway);
    });
})