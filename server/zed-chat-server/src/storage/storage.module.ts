import { Module } from '@nestjs/common';
import { UserModule } from '../users/user.module';
import { StorageController } from './storage.controller';

@Module({
  imports: [UserModule],
  controllers: [StorageController]
})
export class StorageModule {}