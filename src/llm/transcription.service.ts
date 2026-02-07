import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TranscriptionService {
  private readonly logger = new Logger(TranscriptionService.name);
  private readonly apiKey: string;
  private readonly apiUrl = 'https://routellm.abacus.ai/v1/audio/transcriptions';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('ABACUSAI_API_KEY') || '';
  }

  async transcribe(audioBuffer: Buffer): Promise<string> {
    this.logger.log(`Transcribing audio, buffer size: ${audioBuffer.length} bytes`);
    
    // Create form data manually for Node.js
    const boundary = '----FormBoundary' + Math.random().toString(36).substring(2);
    
    const header = Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="audio.ogg"\r\n` +
      `Content-Type: audio/ogg\r\n\r\n`
    );
    
    const modelPart = Buffer.from(
      `\r\n--${boundary}\r\n` +
      `Content-Disposition: form-data; name="model"\r\n\r\n` +
      `whisper-1`
    );
    
    const languagePart = Buffer.from(
      `\r\n--${boundary}\r\n` +
      `Content-Disposition: form-data; name="language"\r\n\r\n` +
      `ru`
    );
    
    const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
    
    const body = Buffer.concat([header, audioBuffer, modelPart, languagePart, footer]);

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: body,
    });

    if (!response.ok) {
      const errText = await response.text();
      this.logger.error(`Transcription API error: ${response.status} - ${errText}`);
      throw new Error(`Transcription failed: ${response.status}`);
    }

    const result = await response.json();
    this.logger.log(`Transcription result: ${result.text}`);
    return result.text || '';
  }
}
