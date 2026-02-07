import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, docs_v1 } from 'googleapis';
import * as fs from 'fs';

@Injectable()
export class GoogleDocsService {
  private readonly logger = new Logger(GoogleDocsService.name);
  private docs: docs_v1.Docs | null = null;
  private readonly documentId: string;

  constructor(private configService: ConfigService) {
    this.documentId = this.configService.get<string>('GOOGLE_DOCUMENT_ID') || '';
    this.initializeClient();
  }

  private initializeClient(): void {
    try {
      const credentialsPath = this.configService.get<string>('GOOGLE_CREDENTIALS_PATH');
      if (credentialsPath && fs.existsSync(credentialsPath)) {
        const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
        const auth = new google.auth.GoogleAuth({
          credentials,
          scopes: ['https://www.googleapis.com/auth/documents'],
        });
        this.docs = google.docs({ version: 'v1', auth });
        this.logger.log('Google Docs client initialized');
      } else {
        this.logger.warn('Google credentials not found. Docs integration disabled.');
      }
    } catch (error) {
      this.logger.error(`Failed to initialize Google Docs: ${error.message}`);
    }
  }

  async appendNote(date: string, text: string): Promise<void> {
    if (!this.docs) {
      this.logger.warn('Google Docs not initialized, skipping detailed note save');
      throw new Error('Google Docs not configured');
    }

    // Get document to find end index
    const doc = await this.docs.documents.get({ documentId: this.documentId });
    const endIndex = doc.data.body?.content?.slice(-1)[0]?.endIndex || 1;

    const formattedText = `\n\n--- ${date} ---\n${text}`;

    await this.docs.documents.batchUpdate({
      documentId: this.documentId,
      requestBody: {
        requests: [{
          insertText: {
            location: { index: endIndex - 1 },
            text: formattedText,
          },
        }],
      },
    });

    this.logger.log(`Detailed note saved for ${date}`);
  }
}
