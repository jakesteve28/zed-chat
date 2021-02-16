import { NestFactory } from '@nestjs/core';
import 'reflect-metadata';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';

const httpsOptions = {
 // key: fs.readFileSync('../keys/key.pem'),
 // cert: fs.readFileSync('../secrets/public.pem'),
};
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, 
    {
      ...httpsOptions,
      logger: console,
    }
  );
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useStaticAssets(join(__dirname, '..', 'static'));
  const port = parseInt(process.env.PORT || `3000`);
  await app.listen(port);
  console.log("Server successfully started on port " + port);
}
bootstrap();
