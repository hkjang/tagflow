import { Controller, Post, Get, Body, Query, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateTagEventDto } from '@shared/event';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WebhooksService } from '../webhooks/webhooks.service';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly webhooksService: WebhooksService,
  ) {}

  @Post()
  async createEvent(@Body() dto: CreateTagEventDto, @Req() req: any) {
    try {
      const sourceIp = req.ip || req.connection.remoteAddress;
      const event = await this.eventsService.createEvent(dto, sourceIp);

      // Trigger webhooks asynchronously (don't await)
      this.webhooksService.triggerWebhooks(event).catch(error => {
        console.error('Webhook trigger failed:', error);
      });

      return event;
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to create event',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getEvents(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('card_uid') card_uid?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filter = {
      startDate,
      endDate,
      card_uid,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    };

    return await this.eventsService.getEvents(filter);
  }
}
