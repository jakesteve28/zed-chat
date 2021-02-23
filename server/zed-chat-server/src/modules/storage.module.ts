import { Module } from '@nestjs/common';
import { UserModule } from './user.module';
import { StorageController } from '../controllers/storage.controller';

@Module({
  imports: [UserModule],
  controllers: [StorageController]
})
export class StorageModule {}