import { TelegramService } from './telegram.service';
import { LlmService } from '../llm/llm.service';
import { TranscriptionService } from '../llm/transcription.service';
import { GoogleSheetsService } from '../google/sheets.service';
import { GoogleDocsService } from '../google/docs.service';
import { ReminderService } from '../reminder/reminder.service';
export declare class MessageHandlerService {
    private readonly telegram;
    private readonly llm;
    private readonly transcription;
    private readonly sheets;
    private readonly docs;
    private readonly reminders;
    private readonly logger;
    constructor(telegram: TelegramService, llm: LlmService, transcription: TranscriptionService, sheets: GoogleSheetsService, docs: GoogleDocsService, reminders: ReminderService);
    handleUpdate(update: any): Promise<void>;
    private processIntent;
    private saveWorkout;
    private saveNote;
    private saveDetailedNote;
    private saveReminder;
}
