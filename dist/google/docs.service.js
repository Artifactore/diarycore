"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GoogleDocsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleDocsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const googleapis_1 = require("googleapis");
const fs = __importStar(require("fs"));
let GoogleDocsService = GoogleDocsService_1 = class GoogleDocsService {
    configService;
    logger = new common_1.Logger(GoogleDocsService_1.name);
    docs = null;
    documentId;
    constructor(configService) {
        this.configService = configService;
        this.documentId = this.configService.get('GOOGLE_DOCUMENT_ID') || '';
        this.initializeClient();
    }
    initializeClient() {
        try {
            const credentialsPath = this.configService.get('GOOGLE_CREDENTIALS_PATH');
            if (credentialsPath && fs.existsSync(credentialsPath)) {
                const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
                const auth = new googleapis_1.google.auth.GoogleAuth({
                    credentials,
                    scopes: ['https://www.googleapis.com/auth/documents'],
                });
                this.docs = googleapis_1.google.docs({ version: 'v1', auth });
                this.logger.log('Google Docs client initialized');
            }
            else {
                this.logger.warn('Google credentials not found. Docs integration disabled.');
            }
        }
        catch (error) {
            this.logger.error(`Failed to initialize Google Docs: ${error.message}`);
        }
    }
    async appendNote(date, text) {
        if (!this.docs) {
            this.logger.warn('Google Docs not initialized, skipping detailed note save');
            throw new Error('Google Docs not configured');
        }
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
};
exports.GoogleDocsService = GoogleDocsService;
exports.GoogleDocsService = GoogleDocsService = GoogleDocsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GoogleDocsService);
//# sourceMappingURL=docs.service.js.map