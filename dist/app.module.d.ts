import { OnModuleInit } from '@nestjs/common';
import { TelegramService } from './telegram/telegram.service';
export declare class AppModule implements OnModuleInit {
    private readonly telegramService;
    private readonly logger;
    constructor(telegramService: TelegramService);
    onModuleInit(): Promise<void>;
}
