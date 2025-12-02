import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WebhooksService } from './webhooks.service';

@Injectable()
export class RetryQueueService {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleRetryQueue() {
    console.log('Processing webhook retry queue...');
    try {
      await this.webhooksService.processRetryQueue();
    } catch (error: any) {
      console.error('Retry queue processing error:', error);
    }
  }
}
