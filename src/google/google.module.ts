import { Module } from '@nestjs/common';
import { GoogleSheetsService } from './sheets.service';
import { GoogleDocsService } from './docs.service';

@Module({
  providers: [GoogleSheetsService, GoogleDocsService],
  exports: [GoogleSheetsService, GoogleDocsService],
})
export class GoogleModule {}
