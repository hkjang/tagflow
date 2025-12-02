import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('events')
  async getEventStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.reportsService.getEventStatistics(startDate, endDate);
  }

  @Get('webhooks')
  async getWebhookStatistics() {
    return await this.reportsService.getWebhookStatistics();
  }

  @Get('export')
  async exportEvents(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.reportsService.exportEvents(startDate, endDate);
  }
}
