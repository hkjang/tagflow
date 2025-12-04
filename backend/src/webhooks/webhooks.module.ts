import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { WebhooksService } from './webhooks.service';
import { WebhooksController, WebhookMappingsController } from './webhooks.controller';
import { RetryQueueService } from './retry-queue.service';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [ScheduleModule.forRoot(), SettingsModule],
  controllers: [WebhooksController, WebhookMappingsController],
  providers: [WebhooksService, RetryQueueService],
  exports: [WebhooksService],
})
export class WebhooksModule { }
