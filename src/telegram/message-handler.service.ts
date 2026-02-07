import { Injectable, Logger } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { LlmService } from '../llm/llm.service';
import { TranscriptionService } from '../llm/transcription.service';
import { GoogleSheetsService } from '../google/sheets.service';
import { GoogleDocsService } from '../google/docs.service';
import { ReminderService } from '../reminder/reminder.service';

@Injectable()
export class MessageHandlerService {
  private readonly logger = new Logger(MessageHandlerService.name);

  constructor(
    private readonly telegram: TelegramService,
    private readonly llm: LlmService,
    private readonly transcription: TranscriptionService,
    private readonly sheets: GoogleSheetsService,
    private readonly docs: GoogleDocsService,
    private readonly reminders: ReminderService,
  ) {}

  async handleUpdate(update: any): Promise<void> {
    const message = update.message;
    if (!message) return;

    const chatId = message.chat.id;
    let text = message.text || '';

    // Handle voice messages
    if (message.voice) {
      this.logger.log('Processing voice message...');
      try {
        const { fileUrl } = await this.telegram.getFile(message.voice.file_id);
        const audioBuffer = await this.telegram.downloadFile(fileUrl);
        text = await this.transcription.transcribe(audioBuffer);
        this.logger.log(`Transcribed: ${text}`);
      } catch (error) {
        this.logger.error(`Transcription failed: ${error.message}`);
        await this.telegram.sendMessage(chatId, 'Мяу, не смог разобрать голосовое сообщение 🙀 Попробуй ещё раз или напиши текстом.');
        return;
      }
    }

    if (!text) {
      await this.telegram.sendMessage(chatId, 'Пришли мне текст или голосовое сообщение, и я помогу записать! 🐱');
      return;
    }

    // Parse message with LLM
    try {
      const parsed = await this.llm.parseMessage(text);
      this.logger.log(`Parsed: ${JSON.stringify(parsed)}`);

      await this.processIntent(chatId, parsed);
    } catch (error) {
      this.logger.error(`LLM processing failed: ${error.message}`);
      await this.telegram.sendMessage(chatId, 'Что-то пошло не так при обработке сообщения 😿 Попробуй переформулировать.');
    }
  }

  private async processIntent(chatId: number, parsed: any): Promise<void> {
    const { intent, data, response, needsClarification } = parsed;

    if (needsClarification) {
      await this.telegram.sendMessage(chatId, response);
      return;
    }

    switch (intent) {
      case 'workout':
        await this.saveWorkout(chatId, data, response);
        break;
      case 'note':
        await this.saveNote(chatId, data, response);
        break;
      case 'detailed_note':
        await this.saveDetailedNote(chatId, data, response);
        break;
      case 'reminder':
        await this.saveReminder(chatId, data, response);
        break;
      case 'question':
      case 'greeting':
      default:
        await this.telegram.sendMessage(chatId, response);
        break;
    }
  }

  private async saveWorkout(chatId: number, data: any, response: string): Promise<void> {
    try {
      await this.sheets.appendWorkout({
        date: data.date || new Date().toLocaleDateString('ru-RU'),
        exercise: data.exercise,
        muscleGroup: data.muscleGroup,
        sets: data.sets,
        reps: data.reps,
        weight: data.weight,
        comment: data.comment || '',
      });
      await this.telegram.sendMessage(chatId, response);
    } catch (error) {
      this.logger.error(`Failed to save workout: ${error.message}`);
      await this.telegram.sendMessage(chatId, 'Мяу, записал в голове, но Google Sheets сейчас недоступен 😿 Попробуй позже.');
    }
  }

  private async saveNote(chatId: number, data: any, response: string): Promise<void> {
    try {
      await this.sheets.appendNote({
        date: data.date || new Date().toLocaleDateString('ru-RU'),
        time: data.time || new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        note: data.text,
      });
      await this.telegram.sendMessage(chatId, response);
    } catch (error) {
      this.logger.error(`Failed to save note: ${error.message}`);
      await this.telegram.sendMessage(chatId, 'Мяу, не смог сохранить заметку в таблицу 😿');
    }
  }

  private async saveDetailedNote(chatId: number, data: any, response: string): Promise<void> {
    try {
      const dateStr = data.date || new Date().toLocaleDateString('ru-RU');
      await this.docs.appendNote(dateStr, data.text);
      await this.telegram.sendMessage(chatId, response);
    } catch (error) {
      this.logger.error(`Failed to save detailed note: ${error.message}`);
      await this.telegram.sendMessage(chatId, 'Мяу, Google Docs не отвечает 😿 Твои мысли важны, попробуй позже!');
    }
  }

  private async saveReminder(chatId: number, data: any, response: string): Promise<void> {
    try {
      await this.reminders.createReminder({
        chatId: BigInt(chatId),
        text: data.text,
        triggerAt: new Date(data.triggerAt),
      });
      await this.telegram.sendMessage(chatId, response);
    } catch (error) {
      this.logger.error(`Failed to save reminder: ${error.message}`);
      await this.telegram.sendMessage(chatId, 'Мяу, не смог создать напоминание 😿');
    }
  }
}
