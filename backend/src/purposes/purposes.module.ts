import { Module } from '@nestjs/common';
import { PurposesController } from './purposes.controller';
import { PurposesService } from './purposes.service';
import { DatabaseModule } from '../database/database.module';
import { WebhooksModule } from '../webhooks/webhooks.module';

@Module({
    imports: [DatabaseModule, WebhooksModule],
    controllers: [PurposesController],
    providers: [PurposesService],
    exports: [PurposesService],
})
export class PurposesModule { }
