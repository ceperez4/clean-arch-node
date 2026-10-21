import 'multer';
import { BadRequestException, PipeTransform } from '@nestjs/common';
import path from 'node:path';
import sharp from 'sharp';
import { ISecureFile } from '../interfaces/files.interface';

export class UploadSecureFilePipe implements PipeTransform<
    Express.Multer.File | Express.Multer.File[],
    Promise<ISecureFile[]>
> {
    async transform(value: Express.Multer.File | Express.Multer.File[]): Promise<ISecureFile[]> {
        if (!value) return value;

        try {
            if (Array.isArray(value)) {
                return await Promise.all(value.map((file) => this.processFile(file)));
            } else {
                const secureFile = await this.processFile(value);
                return [secureFile];
            }
        } catch (error) {
            if (error instanceof BadRequestException) throw error;
            throw new BadRequestException('Error al procesar uno o más archivos. Verifica que sean válidos.');
        }
    }

    /****************************************** */
    /****************************************** */
    async processFile(file: Express.Multer.File): Promise<ISecureFile> {
        if (!file.buffer) {
            throw new BadRequestException('El archivo no se encuentra en memoria.');
        }

        const uniqueSuffix = crypto.randomUUID();
        const extension = path.extname(file.originalname);
        const filename = `${uniqueSuffix}${extension}`;
        let safeBuffer: Buffer;

        if (file.mimetype.startsWith('image/')) {
            safeBuffer = await sharp(file.buffer).resize({ width: 1920, withoutEnlargement: true }).toBuffer();
        } else {
            throw new BadRequestException('Tipo de archivo no soportado para análisis de seguridad.');
        }
        file.buffer = Buffer.alloc(0);
        return {
            originalName: file.originalname,
            filename: filename,
            extension: extension,
            mimetype: file.mimetype,
            size: safeBuffer.length,
            buffer: safeBuffer,
        };
    }
}
