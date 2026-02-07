import { ConfigService } from '@nestjs/config';
import { ReminderService } from './reminder.service';
export declare class ReminderController {
    private readonly reminderService;
    private configService;
    private readonly logger;
    private readonly cronApiKey;
    constructor(reminderService: ReminderService, configService: ConfigService);
    processReminders(apiKey: string): Promise<{
        processed: number;
        message: string;
    }>;
}
