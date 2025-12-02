import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { WebhooksService } from './webhooks.service';
import { WebhooksController, WebhookMappingsController } from './webhooks.controller';
import { RetryQueueService } from './retry-queue.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [WebhooksController, WebhookMappingsController],
  providers: [WebhooksService, RetryQueueService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
