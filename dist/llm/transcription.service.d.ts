import { ConfigService } from '@nestjs/config';
export declare class TranscriptionService {
    private configService;
    private readonly logger;
    private readonly apiKey;
    private readonly apiUrl;
    constructor(configService: ConfigService);
    transcribe(audioBuffer: Buffer): Promise<string>;
}
