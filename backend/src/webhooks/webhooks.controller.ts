import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, HttpException, HttpStatus, Query } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto, HttpMethod } from '@shared/webhook';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@shared/user';

@Controller('webhooks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) { }

  @Get()
  @Roles(UserRole.ADMIN)
  async getAllWebhooks() {
    return await this.webhooksService.getAllWebhooks();
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async createWebhook(@Body() dto: CreateWebhookDto) {
    try {
      return await this.webhooksService.createWebhook(dto);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to create webhook',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  async getWebhook(@Param('id') id: string) {
    try {
      return await this.webhooksService.getWebhookById(parseInt(id));
    } catch (error: any) {
      throw new HttpException('Webhook not found', HttpStatus.NOT_FOUND);
    }
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  async updateWebhook(@Param('id') id: string, @Body() dto: Partial<CreateWebhookDto>) {
    try {
      return await this.webhooksService.updateWebhook(parseInt(id), dto);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to update webhook',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async deleteWebhook(@Param('id') id: string) {
    try {
      await this.webhooksService.deleteWebhook(parseInt(id));
      return { message: 'Webhook deleted successfully' };
    } catch (error: any) {
      throw new HttpException('Failed to delete webhook', HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':id/test')
  @Roles(UserRole.ADMIN)
  async testWebhook(@Param('id') id: string, @Body() testData?: any) {
    try {
      const webhook = await this.webhooksService.getWebhookById(parseInt(id));
      const hasTestData = testData && Object.keys(testData).length > 0;
      const data = hasTestData ? testData : {
        card_uid: 'TEST123456',
        event_time: new Date().toISOString(),
        source_ip: '127.0.0.1',
      };

      await this.webhooksService.executeWebhook(webhook, data);
      return { message: 'Webhook test successful' };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Webhook test failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('logs/all')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  async getAllLogs(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 100;
    return await this.webhooksService.getWebhookLogs(undefined, limitNum);
  }

  @Get(':id/logs')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  async getWebhookLogs(@Param('id') id: string, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 100;
    return await this.webhooksService.getWebhookLogs(parseInt(id), limitNum);
  }
}

@Controller('webhook-mappings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class WebhookMappingsController {
  constructor(private readonly webhooksService: WebhooksService) { }

  @Get(':webhookId')
  async getMappings(@Param('webhookId') webhookId: string) {
    return await this.webhooksService.getMappingsByWebhookId(parseInt(webhookId));
  }

  @Post()
  async createMapping(
    @Body() body: { webhook_id: number; from_key: string; to_key: string },
  ) {
    try {
      return await this.webhooksService.createMapping(
        body.webhook_id,
        body.from_key,
        body.to_key,
      );
    } catch (error: any) {
      throw new HttpException(
        'Failed to create mapping',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':id')
  async updateMapping(
    @Param('id') id: string,
    @Body() body: { from_key?: string; to_key?: string },
  ) {
    try {
      return await this.webhooksService.updateMapping(
        parseInt(id),
        body.from_key,
        body.to_key,
      );
    } catch (error: any) {
      throw new HttpException(
        'Failed to update mapping',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  async deleteMapping(@Param('id') id: string) {
    try {
      await this.webhooksService.deleteMapping(parseInt(id));
      return { message: 'Mapping deleted successfully' };
    } catch (error: any) {
      throw new HttpException('Failed to delete mapping', HttpStatus.BAD_REQUEST);
    }
  }
}
