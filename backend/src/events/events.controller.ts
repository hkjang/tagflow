import { Controller, Post, Get, Body, Query, UseGuards, Req, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateTagEventDto } from '@shared/event';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@shared/user';
import { WebhooksService } from '../webhooks/webhooks.service';

@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly webhooksService: WebhooksService,
  ) { }

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

  @Post('manual')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  async createManualTagInput(@Body() dto: CreateTagEventDto, @Req() req: any) {
    console.log('==== Manual Tag Input Request ====');
    console.log('DTO:', dto);
    console.log('User:', req.user);

    // Validate that card_uid is exactly 8 characters
    if (!dto.card_uid || dto.card_uid.length !== 8) {
      console.log('Validation failed: Card UID must be exactly 8 characters');
      throw new BadRequestException('Card UID must be exactly 8 characters');
    }

    try {
      const sourceIp = req.ip || req.connection.remoteAddress;
      console.log('Creating event with source IP:', sourceIp);

      const event = await this.eventsService.createEvent(dto, sourceIp);
      console.log('Event created successfully:', event);

      // Trigger webhooks asynchronously (don't await)
      this.webhooksService.triggerWebhooks(event).catch(error => {
        console.error('Webhook trigger failed:', error);
      });

      return {
        success: true,
        event,
        message: 'Tag registered successfully',
      };
    } catch (error: any) {
      console.error('==== Manual Tag Input Error ====');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);

      throw new HttpException(
        error.message || 'Failed to create tag event',
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
