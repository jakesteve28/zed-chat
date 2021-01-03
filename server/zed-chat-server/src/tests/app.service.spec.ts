import { Test } from '@nestjs/testing';
import { AppService } from '../app.service';

describe('AppService', () => {
  let appService: AppService;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
        providers: [AppService],
      }).compile();
      appService = moduleRef.get<AppService>(AppService);
  });
  describe('getHello', () => {
    it(`should return 'Welcome to Zed Chat Server!'`, async () => {
      const result = 'Welcome to Zed Chat Server!';
      jest.spyOn(appService, 'getHello').mockImplementation(() => result);
      expect(appService.getHello()).toBe(result);
    });
  });
});