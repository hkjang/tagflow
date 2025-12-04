import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { CleanupModule } from './cleanup/cleanup.module';
import { ReportsModule } from './reports/reports.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    EventsModule,
    WebhooksModule,
    CleanupModule,
    ReportsModule,
    SettingsModule,
  ],
})
export class AppModule { }
