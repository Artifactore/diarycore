import { Module } from '@nestjs/common';
import { LlmService } from './llm.service';
import { TranscriptionService } from './transcription.service';

@Module({
  providers: [LlmService, TranscriptionService],
  exports: [LlmService, TranscriptionService],
})
export class LlmModule {}
