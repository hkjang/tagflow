import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Req,
    HttpException,
    HttpStatus,
    ParseIntPipe,
} from '@nestjs/common';
import { PurposesService } from './purposes.service';
import {
    CreateTagPurposeDto,
    CreatePurposeFieldDto,
    CreatePurposeWebhookDto,
    CreatePurposeRuleDto,
    CreatePurposeFollowupDto,
} from '@shared/purpose';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@shared/user';

@Controller('purposes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PurposesController {
    constructor(private readonly purposesService: PurposesService) { }

    // ========== PURPOSE ENDPOINTS ==========

    @Get()
    async getAllPurposes() {
        return await this.purposesService.getAllPurposes();
    }

    @Get('active')
    async getActivePurposes() {
        return await this.purposesService.getActivePurposes();
    }

    @Get('stats')
    async getAllStats() {
        return await this.purposesService.getPurposeStats();
    }

    @Get('logs')
    @Roles(UserRole.ADMIN)
    async getLogs(
        @Query('purposeId') purposeId?: string,
        @Query('entityType') entityType?: string,
        @Query('limit') limit?: string,
    ) {
        return await this.purposesService.getLogs({
            purposeId: purposeId ? parseInt(purposeId) : undefined,
            entityType,
            limit: limit ? parseInt(limit) : 100,
        });
    }

    @Get(':id')
    async getPurposeById(@Param('id', ParseIntPipe) id: number) {
        try {
            return await this.purposesService.getPurposeById(id);
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }

    @Get(':id/stats')
    async getPurposeStats(@Param('id', ParseIntPipe) id: number) {
        const stats = await this.purposesService.getPurposeStats(id);
        return stats[0] || null;
    }

    @Post()
    @Roles(UserRole.ADMIN)
    async createPurpose(@Body() dto: CreateTagPurposeDto, @Req() req: any) {
        try {
            return await this.purposesService.createPurpose(dto, req.user?.id);
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Put(':id')
    @Roles(UserRole.ADMIN)
    async updatePurpose(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: Partial<CreateTagPurposeDto>,
        @Req() req: any,
    ) {
        try {
            return await this.purposesService.updatePurpose(id, dto, req.user?.id);
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    async deletePurpose(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
        try {
            await this.purposesService.deletePurpose(id, req.user?.id);
            return { message: 'Purpose deleted successfully' };
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    // ========== FIELD ENDPOINTS ==========

    @Get(':id/fields')
    async getFields(@Param('id', ParseIntPipe) id: number) {
        return await this.purposesService.getFieldsByPurposeId(id);
    }

    @Post(':id/fields')
    @Roles(UserRole.ADMIN, UserRole.OPERATOR)
    async createField(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: CreatePurposeFieldDto,
        @Req() req: any,
    ) {
        try {
            return await this.purposesService.createField(id, dto, req.user?.id);
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Put('fields/:fieldId')
    @Roles(UserRole.ADMIN, UserRole.OPERATOR)
    async updateField(
        @Param('fieldId', ParseIntPipe) fieldId: number,
        @Body() dto: Partial<CreatePurposeFieldDto>,
        @Req() req: any,
    ) {
        try {
            return await this.purposesService.updateField(fieldId, dto, req.user?.id);
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Delete('fields/:fieldId')
    @Roles(UserRole.ADMIN, UserRole.OPERATOR)
    async deleteField(@Param('fieldId', ParseIntPipe) fieldId: number, @Req() req: any) {
        try {
            await this.purposesService.deleteField(fieldId, req.user?.id);
            return { message: 'Field deleted successfully' };
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    // ========== WEBHOOK ENDPOINTS ==========

    @Get(':id/webhooks')
    async getWebhooks(@Param('id', ParseIntPipe) id: number) {
        return await this.purposesService.getWebhooksByPurposeId(id);
    }

    @Post(':id/webhooks')
    @Roles(UserRole.ADMIN)
    async createPurposeWebhook(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: CreatePurposeWebhookDto,
        @Req() req: any,
    ) {
        try {
            return await this.purposesService.createPurposeWebhook(id, dto, req.user?.id);
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Put('webhooks/:pwId')
    @Roles(UserRole.ADMIN)
    async updatePurposeWebhook(
        @Param('pwId', ParseIntPipe) pwId: number,
        @Body() dto: Partial<CreatePurposeWebhookDto>,
        @Req() req: any,
    ) {
        try {
            return await this.purposesService.updatePurposeWebhook(pwId, dto, req.user?.id);
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Delete('webhooks/:pwId')
    @Roles(UserRole.ADMIN)
    async deletePurposeWebhook(@Param('pwId', ParseIntPipe) pwId: number, @Req() req: any) {
        try {
            await this.purposesService.deletePurposeWebhook(pwId, req.user?.id);
            return { message: 'Purpose webhook deleted successfully' };
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    // ========== RULE ENDPOINTS ==========

    @Get(':id/rules')
    async getRules(@Param('id', ParseIntPipe) id: number) {
        return await this.purposesService.getRulesByPurposeId(id);
    }

    @Post(':id/rules')
    @Roles(UserRole.ADMIN, UserRole.OPERATOR)
    async createRule(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: CreatePurposeRuleDto,
        @Req() req: any,
    ) {
        try {
            return await this.purposesService.createRule(id, dto, req.user?.id);
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Put('rules/:ruleId')
    @Roles(UserRole.ADMIN, UserRole.OPERATOR)
    async updateRule(
        @Param('ruleId', ParseIntPipe) ruleId: number,
        @Body() dto: Partial<CreatePurposeRuleDto>,
        @Req() req: any,
    ) {
        try {
            return await this.purposesService.updateRule(ruleId, dto, req.user?.id);
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Delete('rules/:ruleId')
    @Roles(UserRole.ADMIN, UserRole.OPERATOR)
    async deleteRule(@Param('ruleId', ParseIntPipe) ruleId: number, @Req() req: any) {
        try {
            await this.purposesService.deleteRule(ruleId, req.user?.id);
            return { message: 'Rule deleted successfully' };
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    // ========== FOLLOWUP ENDPOINTS ==========

    @Get(':id/followups')
    async getFollowups(@Param('id', ParseIntPipe) id: number) {
        return await this.purposesService.getFollowupsByPurposeId(id);
    }

    @Post(':id/followups')
    @Roles(UserRole.ADMIN)
    async createFollowup(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: CreatePurposeFollowupDto,
        @Req() req: any,
    ) {
        try {
            return await this.purposesService.createFollowup(id, dto, req.user?.id);
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Put('followups/:followupId')
    @Roles(UserRole.ADMIN)
    async updateFollowup(
        @Param('followupId', ParseIntPipe) followupId: number,
        @Body() dto: Partial<CreatePurposeFollowupDto>,
        @Req() req: any,
    ) {
        try {
            return await this.purposesService.updateFollowup(followupId, dto, req.user?.id);
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Delete('followups/:followupId')
    @Roles(UserRole.ADMIN)
    async deleteFollowup(@Param('followupId', ParseIntPipe) followupId: number, @Req() req: any) {
        try {
            await this.purposesService.deleteFollowup(followupId, req.user?.id);
            return { message: 'Followup deleted successfully' };
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    // ========== VALIDATION ENDPOINT ==========

    @Post(':id/validate')
    async validatePurposeData(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: Record<string, any>,
    ) {
        return await this.purposesService.validatePurposeData(id, data);
    }
}
