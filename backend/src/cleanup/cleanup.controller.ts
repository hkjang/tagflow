import { Controller, Get, Post, UseGuards, Query, HttpException, HttpStatus } from '@nestjs/common';
import { CleanupService } from './cleanup.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@shared/user';

@Controller('cleanup')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class CleanupController {
  constructor(private readonly cleanupService: CleanupService) { }

  @Get('logs')
  async getCleanupLogs(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 100;
    return await this.cleanupService.getCleanupLogs(limitNum);
  }

  @Get('fail-logs')
  async getFailLogs(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 100;
    return await this.cleanupService.getCleanupFailLogs(limitNum);
  }

  @Post('manual')
  async manualCleanup(@CurrentUser() user: any) {
    try {
      return await this.cleanupService.manualCleanup(user.sub);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Cleanup failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('reset-tag-events')
  async resetTagEvents(@CurrentUser() user: any) {
    try {
      return await this.cleanupService.resetTagEvents(user.sub);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Reset tag events failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('reset-webhook-logs')
  async resetWebhookLogs(@CurrentUser() user: any) {
    try {
      return await this.cleanupService.resetWebhookLogs(user.sub);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Reset webhook logs failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
