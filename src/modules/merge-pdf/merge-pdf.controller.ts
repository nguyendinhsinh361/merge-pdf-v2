/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-var-requires */
import {
  Body,
  Controller,
  Header,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  StreamableFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { MergePdfService } from './merge-pdf.service';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { MergePdfDto } from './dto/merge-pdf.dto';
import * as fs from 'fs';

@ApiTags('Merge-Pdf')
@Controller('merge-pdf')
export class MergePdfController {
  constructor(private readonly mergePdfService: MergePdfService) {}

  @Post()
  @ApiOperation({ summary: 'Merge PDF' })
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: './uploads/src',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.OK)
  @Header('Content-type', 'application/pdf')
  async mergePdf(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() mergePdfDto: MergePdfDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    const rimraf = require("rimraf");
    rimraf("./data-pdf", function () { 
      const dataPdf = `./data-pdf`;
      try {
          if (!fs.existsSync(dataPdf)){
              fs.mkdirSync(dataPdf)
          }
      } catch (err) {
          console.log("Folder existed")
      }
    });
    
    const url = await this.mergePdfService.mergePdf(files, mergePdfDto)
    const urlT = url.toString();
    const file = createReadStream(join(process.cwd(), urlT));
    const stats = fs.statSync(file.path);
    const sizeCheck = stats.size;
    const filefileSizeInBytes = `${stats.size} Byte`;
    const  fileSizeInMegabytes = `${(stats.size/Math.pow(1024,2)).toFixed(4)} Mb`;
    const  fileSizeInGygabytes = `${(stats.size/Math.pow(1024,3)).toFixed(4)} Gb`;
    const size = sizeCheck >= Math.pow(1024, 3) ? fileSizeInGygabytes : (sizeCheck >= Math.pow(1024,2) ? fileSizeInMegabytes: filefileSizeInBytes)
    const directory = '././uploads/src';
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${urlT.split('/')[urlT.split('/').length -1]}`,
      'size': size,
    });

    fs.readdir(directory, (err, files) => {
      if (err) throw err;
      for (const file of files) {
        fs.unlink(`./uploads/src/${file}`, err => {
          if (err) throw err;
        });
      }
    });
    const result = await this.mergePdfService.uploadFile(urlT)
    
    return result;
  }
}
