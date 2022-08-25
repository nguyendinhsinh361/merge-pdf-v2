/* eslint-disable prettier/prettier */
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class MergePdfDto {
  @IsOptional()
  @ApiProperty({ type: [String], format: 'binary', required: false })
  payload: string[];
}
