import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TranscriptionService {
  private readonly logger = new Logger(TranscriptionService.name);
  private readonly apiKey: string;
  private readonly apiUrl = 'https://apps.abacus.ai/v1/audio/transcriptions';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('ABACUSAI_API_KEY') || '';
  }

  async transcribe(audioBuffer: Buffer): Promise<string> {
    const formData = new FormData();
    const blob = new Blob([audioBuffer], { type: 'audio/ogg' });
    formData.append('file', blob, 'audio.ogg');
    formData.append('model', 'whisper-1');
    formData.append('language', 'ru');

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      this.logger.error(`Transcription API error: ${errText}`);
      throw new Error(`Transcription failed: ${response.status}`);
    }

    const result = await response.json();
    return result.text || '';
  }
}
