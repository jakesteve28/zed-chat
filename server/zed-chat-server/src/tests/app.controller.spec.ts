// import { JwtModule } from '@nestjs/jwt';
// import { Test, TestingModule } from '@nestjs/testing';
// import { AuthModule } from '../auth/auth.module';
// import { jwtConstants } from '../auth/constants';
// import { AppController } from '../app.controller';
// import { AppService } from '../app.service';

// describe('AppController', () => {
//   let appController: AppController;
//   beforeEach(async () => {
//     const app: TestingModule = await Test.createTestingModule({
//       imports: [JwtModule.register({
//         secret: jwtConstants.secret,
//         signOptions: { expiresIn: '24h' }
//       }), AuthModule],
//       controllers: [AppController],
//       providers: [AppService],
//     }).compile();

//     appController = app.get<AppController>(AppController);
//   });

//   describe('root', () => {
//     it('should return "Hello World!"', () => {
//       expect(appController.getHello()).toBe('Hello World!');
//     });
//   });
// });
