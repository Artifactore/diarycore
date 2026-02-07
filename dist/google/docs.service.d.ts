import { ConfigService } from '@nestjs/config';
export declare class GoogleDocsService {
    private configService;
    private readonly logger;
    private docs;
    private readonly documentId;
    constructor(configService: ConfigService);
    private initializeClient;
    appendNote(date: string, text: string): Promise<void>;
}
