import { Module } from '@nestjs/common';
import { CleanupService } from './cleanup.service';
import { CleanupController } from './cleanup.controller';

@Module({
  controllers: [CleanupController],
  providers: [CleanupService],
  exports: [CleanupService],
})
export class CleanupModule {}
