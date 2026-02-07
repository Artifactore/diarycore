import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, sheets_v4 } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

export interface WorkoutData {
  date: string;
  exercise: string;
  muscleGroup: string;
  sets: number;
  reps: number;
  weight: number;
  comment: string;
}

export interface NoteData {
  date: string;
  time: string;
  note: string;
}

@Injectable()
export class GoogleSheetsService {
  private readonly logger = new Logger(GoogleSheetsService.name);
  private sheets: sheets_v4.Sheets | null = null;
  private readonly spreadsheetId: string;

  constructor(private configService: ConfigService) {
    this.spreadsheetId = this.configService.get<string>('GOOGLE_SPREADSHEET_ID') || '';
    this.initializeClient();
  }

  private initializeClient(): void {
    try {
      let credentials: any = null;
      
      // Try base64 encoded credentials first (for production)
      const credentialsBase64 = this.configService.get<string>('GOOGLE_CREDENTIALS_BASE64');
      if (credentialsBase64) {
        credentials = JSON.parse(Buffer.from(credentialsBase64, 'base64').toString('utf8'));
        this.logger.log('Loaded credentials from GOOGLE_CREDENTIALS_BASE64');
      } else {
        // Fallback to file path (for local development)
        const credentialsPath = this.configService.get<string>('GOOGLE_CREDENTIALS_PATH');
        if (credentialsPath && fs.existsSync(credentialsPath)) {
          credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
          this.logger.log('Loaded credentials from file');
        }
      }
      
      if (credentials) {
        const auth = new google.auth.GoogleAuth({
          credentials,
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        this.sheets = google.sheets({ version: 'v4', auth });
        this.logger.log('Google Sheets client initialized');
      } else {
        this.logger.warn('Google credentials not found. Sheets integration disabled.');
      }
    } catch (error) {
      this.logger.error(`Failed to initialize Google Sheets: ${error.message}`);
    }
  }

  async appendWorkout(data: WorkoutData): Promise<void> {
    if (!this.sheets) {
      this.logger.warn('Google Sheets not initialized, skipping workout save');
      throw new Error('Google Sheets not configured');
    }

    const values = [[
      data.date,
      data.exercise,
      data.muscleGroup,
      data.sets,
      data.reps,
      data.weight,
      data.comment,
    ]];

    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: 'Тренировки!A:G',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    this.logger.log(`Workout saved: ${data.exercise}`);
  }

  async appendNote(data: NoteData): Promise<void> {
    if (!this.sheets) {
      this.logger.warn('Google Sheets not initialized, skipping note save');
      throw new Error('Google Sheets not configured');
    }

    const values = [[
      data.date,
      data.time,
      data.note,
    ]];

    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: 'Заметки!A:C',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    this.logger.log(`Note saved: ${data.note.substring(0, 50)}...`);
  }
}
