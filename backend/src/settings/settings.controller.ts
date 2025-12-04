import { Controller, Get, Post, Body } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    async getSettings() {
        return await this.settingsService.getAllSettings();
    }

    @Post()
    async updateSettings(@Body() settings: Record<string, string>) {
        return await this.settingsService.updateSettings(settings);
    }
}
