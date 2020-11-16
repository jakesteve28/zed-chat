import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, 
    {
      logger: console,
    }
  );
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useStaticAssets(join(__dirname, '..', 'static'));
  await app.listen(process.env.PORT || 5000);
}
bootstrap();
