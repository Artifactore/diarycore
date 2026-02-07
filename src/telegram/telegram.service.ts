import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly botToken: string;
  private readonly apiUrl: string;

  constructor(private configService: ConfigService) {
    this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN') || '';
    this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  async sendMessage(chatId: number | bigint, text: string): Promise<void> {
    try {
      await axios.post(`${this.apiUrl}/sendMessage`, {
        chat_id: chatId.toString(),
        text,
        parse_mode: 'HTML',
      });
      this.logger.log(`Message sent to ${chatId}`);
    } catch (error) {
      this.logger.error(`Failed to send message: ${error.message}`);
      throw error;
    }
  }

  async getFile(fileId: string): Promise<{ filePath: string; fileUrl: string }> {
    try {
      const response = await axios.get(`${this.apiUrl}/getFile`, {
        params: { file_id: fileId },
      });
      const filePath = response.data.result.file_path;
      const fileUrl = `https://api.telegram.org/file/bot${this.botToken}/${filePath}`;
      return { filePath, fileUrl };
    } catch (error) {
      this.logger.error(`Failed to get file: ${error.message}`);
      throw error;
    }
  }

  async downloadFile(fileUrl: string): Promise<Buffer> {
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  }

  async setWebhook(webhookUrl: string): Promise<boolean> {
    try {
      const response = await axios.post(`${this.apiUrl}/setWebhook`, {
        url: webhookUrl,
      });
      this.logger.log(`Webhook set result: ${JSON.stringify(response.data)}`);
      return response.data.ok;
    } catch (error) {
      this.logger.error(`Failed to set webhook: ${error.message}`);
      return false;
    }
  }
}
