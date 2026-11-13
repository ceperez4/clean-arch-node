import 'multer';
import { BadRequestException, PipeTransform } from '@nestjs/common';
import sharp from 'sharp';
import { ISecureFile } from '../interfaces/files.interface';
import { randomUUID } from 'node:crypto';
import { ALLOWED_IMAGE_MIME_TYPES } from '../constants/mime-types.constant';

export class UploadSecureFilePipe implements PipeTransform<
    Express.Multer.File | Express.Multer.File[],
    Promise<ISecureFile[]>
> {
    async transform(value: Express.Multer.File | Express.Multer.File[]): Promise<ISecureFile[]> {
        if (!value) return [];

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
        if (!file?.buffer || file.buffer.length === 0) {
            throw new BadRequestException('El archivo no se encuentra en memoria.');
        }

        if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
            throw new BadRequestException('Tipo de archivo no soportado para análisis de seguridad.');
        }

        const uniqueSuffix = randomUUID();
        const extension = '.webp';
        const filename = `${uniqueSuffix}${extension}`;
        const outputMimetype = 'image/webp';

        let safeBuffer: Buffer;
        try {
            safeBuffer = await sharp(file.buffer)
                .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 85 })
                .toBuffer();
        } catch {
            throw new BadRequestException('El archivo no es una imagen válida o está dañado.');
        }

        file.buffer = Buffer.alloc(0);
        return {
            originalName: file.originalname,
            filename: filename,
            extension: extension,
            mimetype: outputMimetype,
            size: safeBuffer.length,
            buffer: safeBuffer,
        };
    }
}
