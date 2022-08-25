/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable } from "@nestjs/common";
import * as fs from 'fs';
import * as PDFDocument from 'pdfkit';
import { MergePdfDto } from "./dto/merge-pdf.dto";
import * as AWS from 'aws-sdk'

@Injectable()
export class MergePdfService { 
    async uploadAndConvertFilesToPdf(files: Array<Express.Multer.File>, mergePdfDto: MergePdfDto): Promise<any> {
        const { payload } = mergePdfDto;
        const dataT = [];
        const pdfArr = [];
        if(files.length != 0) {
            
            files.forEach(file => {
                if (fs.existsSync(file.originalname)) {
                    fs.unlinkSync(`./${file.originalname}`);
                }
                dataT.push(file.path);
            })
        }
        
            
        for(const res of dataT) {
            if(!res.includes('.pdf')) {
                const doc = new PDFDocument();
                doc.pipe(fs.createWriteStream(`${res.split('.')[0]}.pdf`));
                await doc.image(res, {
                    fit: [500, 600],
                    align: 'center',
                    valign: 'center'
                  })
                await doc.end();
                pdfArr.push(`${res.split('.')[0]}.pdf`)
            }else {
                pdfArr.push(res);
            }
            
        }
        return pdfArr;
    }

    async uploadFile (fileName) {
        const s3 = new AWS.S3({
            accessKeyId: process.env.ACCESS_KEY,
            secretAccessKey: process.env.PRIVATE_KEY,
        });
        // Read content from the file
        const fileContent = fs.readFileSync(fileName);
    
        // Setting up S3 upload parameters
        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: fileName.split('/')[fileName.split('/').length-1], // File name you want to save as in S3
            Body: fileContent,
            ACL:'public-read'
        };
    
        // Uploading files to the bucket
        s3.upload(params, function(err, data) {
            if (err) {
                throw err;
            }
            console.log(`File uploaded successfully. ${data.Location}`);
        });
    };

    async mergePdf(files: Array<Express.Multer.File>, mergePdfDto: MergePdfDto) {
        
        const pdfArr  = await this.uploadAndConvertFilesToPdf(files, mergePdfDto);
        const randomName = Array(32)
                .fill(null)
                .map(() => Math.round(Math.random() * 16).toString(16))
                .join('');
        const resultUrl =  `./data-pdf/${randomName}.pdf`;
        
        return new Promise((resolve, reject) => {
            setTimeout(async() => {
                const PDFMerger = require('pdf-merger-js');
                const merger = new PDFMerger();
                await (async () => {
                    for(const res of pdfArr) {
                        await merger.add(res);
                    }
                    await merger.save(resultUrl);
                })()
                resolve(resultUrl);
            }, 1000)
          });
    }

}
