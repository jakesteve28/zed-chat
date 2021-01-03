import { Test } from '@nestjs/testing';
// import { MessageService } from '../messages/message.service';
import { ChatGateway } from '../../socket-gateways/chat.gateway';
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