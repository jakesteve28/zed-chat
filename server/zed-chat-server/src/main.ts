/**
 * 2021 Jacob Stevens
 * The main file of Zodd, where the server is setup. 
 * The global prefix is 'api'
 * The app uses cors, compression, and cookie parser middlewares globally.
 * TODO: add helmet, csurf protection, https
 */

import { NestFactory } from '@nestjs/core';
import 'reflect-metadata';
import { AppModule } from './modules/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import compression from 'compression';
//import open from 'open'; 
/**
 * Private and public keys for https/TLS 
 */
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
  //open('http://localhost:3000/static/activation.mp3');
  app.setGlobalPrefix('api');
  app.enableCors();
  app.use(cookieParser(process.env.COOKIE_SIGNED_SECRET || "SecretSecret123"));
  app.use(compression());
  const port = parseInt(process.env.PORT || `3000`);
  await app.listen(port);
  console.log("Server successfully started on port " + port);
}
bootstrap();
