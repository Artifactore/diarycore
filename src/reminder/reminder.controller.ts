import { Controller, Post, Headers, UnauthorizedException, Logger, HttpCode, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ReminderService } from './reminder.service';

@ApiTags('reminders')
@Controller('reminders')
export class ReminderController {
  private readonly logger = new Logger(ReminderController.name);
  private readonly cronApiKey: string;

  constructor(
    private readonly reminderService: ReminderService,
    private configService: ConfigService,
  ) {
    this.cronApiKey = this.configService.get<string>('CRON_API_KEY') || '';
  }

  @Post('process')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Process and send due reminders (called by cron)' })
  @ApiHeader({ name: 'x-api-key', description: 'API key for cron authentication' })
  @ApiResponse({ status: 200, description: 'Reminders processed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async processReminders(@Headers('x-api-key') apiKey: string): Promise<{ processed: number; message: string }> {
    if (!this.cronApiKey || apiKey !== this.cronApiKey) {
      this.logger.warn('Unauthorized cron access attempt');
      throw new UnauthorizedException('Invalid API key');
    }

    this.logger.log('Processing reminders...');
    const processed = await this.reminderService.processDueReminders();
    
    return {
      processed,
      message: `Processed ${processed} reminders`,
    };
  }
}
