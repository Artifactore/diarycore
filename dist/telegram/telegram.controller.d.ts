import { MessageHandlerService } from './message-handler.service';
export declare class TelegramController {
    private readonly messageHandler;
    private readonly logger;
    constructor(messageHandler: MessageHandlerService);
    handleWebhook(update: any): Promise<{
        ok: boolean;
    }>;
}
