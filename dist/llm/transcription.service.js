"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TranscriptionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranscriptionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let TranscriptionService = TranscriptionService_1 = class TranscriptionService {
    configService;
    logger = new common_1.Logger(TranscriptionService_1.name);
    apiKey;
    apiUrl = 'https://routellm.abacus.ai/v1/audio/transcriptions';
    constructor(configService) {
        this.configService = configService;
        this.apiKey = this.configService.get('ABACUSAI_API_KEY') || '';
    }
    async transcribe(audioBuffer) {
        this.logger.log(`Transcribing audio, buffer size: ${audioBuffer.length} bytes`);
        const boundary = '----FormBoundary' + Math.random().toString(36).substring(2);
        const header = Buffer.from(`--${boundary}\r\n` +
            `Content-Disposition: form-data; name="file"; filename="audio.ogg"\r\n` +
            `Content-Type: audio/ogg\r\n\r\n`);
        const modelPart = Buffer.from(`\r\n--${boundary}\r\n` +
            `Content-Disposition: form-data; name="model"\r\n\r\n` +
            `whisper-1`);
        const languagePart = Buffer.from(`\r\n--${boundary}\r\n` +
            `Content-Disposition: form-data; name="language"\r\n\r\n` +
            `ru`);
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
};
exports.TranscriptionService = TranscriptionService;
exports.TranscriptionService = TranscriptionService = TranscriptionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TranscriptionService);
//# sourceMappingURL=transcription.service.js.map