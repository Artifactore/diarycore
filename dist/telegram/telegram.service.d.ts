import { ConfigService } from '@nestjs/config';
export declare class TelegramService {
    private configService;
    private readonly logger;
    private readonly botToken;
    private readonly apiUrl;
    constructor(configService: ConfigService);
    sendMessage(chatId: number | bigint, text: string): Promise<void>;
    getFile(fileId: string): Promise<{
        filePath: string;
        fileUrl: string;
    }>;
    downloadFile(fileUrl: string): Promise<Buffer>;
    setWebhook(webhookUrl: string): Promise<boolean>;
}
