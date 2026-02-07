import { Controller, Post, Body, Logger, HttpCode, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { MessageHandlerService } from './message-handler.service';

@ApiTags('telegram')
@Controller('webhook')
export class TelegramController {
  private readonly logger = new Logger(TelegramController.name);

  constructor(private readonly messageHandler: MessageHandlerService) {}

  @Post('telegram')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Telegram webhook endpoint' })
  @ApiBody({ description: 'Telegram update object', type: Object })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleWebhook(@Body() update: any): Promise<{ ok: boolean }> {
    this.logger.log(`Received update: ${JSON.stringify(update).substring(0, 200)}...`);
    
    try {
      await this.messageHandler.handleUpdate(update);
    } catch (error) {
      this.logger.error(`Error handling update: ${error.message}`, error.stack);
    }

    return { ok: true };
  }
}
