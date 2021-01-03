import { Test } from '@nestjs/testing';
import { UserService } from '../../users/user.service';
import { NotificationsGateway } from '../notification.gateway';

describe('NotificationGateway', () => {
    let gateway: NotificationsGateway;
    let userService: UserService;
    const client = {
        emit: jest.fn()
    };

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [NotificationsGateway]
        }).compile();
        gateway = moduleRef.get<NotificationsGateway>(NotificationsGateway);
    });
})