import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { WebhooksModule } from '../webhooks/webhooks.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [WebhooksModule, SettingsModule],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule { }
