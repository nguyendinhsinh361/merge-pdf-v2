/* eslint-disable prettier/prettier */
import { Module } from "@nestjs/common";
import { MergePdfController } from "./merge-pdf.controller";
import { MergePdfService } from "./merge-pdf.service";

@Module({
  imports: [],
  controllers: [MergePdfController],
  providers: [MergePdfService],
  exports: [],
})
export class MergePdfModule {}