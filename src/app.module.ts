/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-var-requires */
import { Module } from '@nestjs/common';
import { MergePdfModule } from './modules/merge-pdf/merge-pdf.module';
@Module({
  imports: [
    MergePdfModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
