import { applyDecorators, BadRequestException, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

export const FileSize = {
    '1_MB': 1 * 1024 * 1024,
    '2_MB': 2 * 1024 * 1024,
    '3_MB': 3 * 1024 * 1024,
    '4_MB': 4 * 1024 * 1024,
    '5_MB': 5 * 1024 * 1024,
    '10_MB': 10 * 1024 * 1024,
    '15_MB': 15 * 1024 * 1024,
    '30_MB': 30 * 1024 * 1024,
    '50_MB': 50 * 1024 * 1024,
} as const;

export type FileSize = (typeof FileSize)[keyof typeof FileSize];

export function UploadFiles(fieldName: string, fileSize: number, maxCount: number = 1) {
    return applyDecorators(
        UseInterceptors(
            FilesInterceptor(fieldName, maxCount, {
                storage: memoryStorage(),
                fileFilter: (_, file, cb) => {
                    const allowedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
                    if (allowedMimeTypes.includes(file.mimetype)) {
                        cb(null, true);
                    } else {
                        cb(
                            new BadRequestException(
                                'Formato no permitido. Solo se aceptan archivos jpg, jpeg, png, webp',
                            ),
                            false,
                        );
                    }
                },
                limits: { fileSize: fileSize },
            }),
        ),
    );
}
