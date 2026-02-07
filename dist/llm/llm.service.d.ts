import { ConfigService } from '@nestjs/config';
export interface ParsedMessage {
    intent: 'workout' | 'note' | 'detailed_note' | 'reminder' | 'question' | 'greeting';
    data: any;
    response: string;
    needsClarification: boolean;
}
export declare class LlmService {
    private configService;
    private readonly logger;
    private readonly apiKey;
    private readonly apiUrl;
    constructor(configService: ConfigService);
    parseMessage(text: string): Promise<ParsedMessage>;
}
