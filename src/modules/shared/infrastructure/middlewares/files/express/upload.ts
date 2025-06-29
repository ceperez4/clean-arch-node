import multer, { FileFilterCallback } from 'multer';
import { Request, Response, NextFunction } from "express";

interface uploadOptions {
    fileStorage: multer.StorageEngine;
    fileSize: number;
    filter: (
        req: Request,
        file: Express.Multer.File,
        callback: FileFilterCallback,
    ) => void;
    field: string;
    isRequired: boolean;
}

const createUploadMiddleware = (options: uploadOptions) => (req: Request, res: Response, next: NextFunction) => {
    const upload = multer({
        storage: options.fileStorage,
        limits: { fileSize: options.fileSize },
        fileFilter: options.filter,
    }).single(options.field);

    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            const errorMessages = {
                'LIMIT_UNEXPECTED_FILE': "Se ha recibido un archivo no esperado. Verifica que estás subiendo los archivos correctos.",
                'LIMIT_FILE_SIZE': `El tamaño del archivo supera el límite permitido. Tamaño máximo de archivo permitido: ${(options.fileSize / 1024 / 1024).toFixed(2)} MB`,
                'LIMIT_PART_COUNT': "Se ha excedido el número máximo de partes permitidas en la solicitud.",
                'LIMIT_FILE_COUNT': "Se ha excedido el número máximo de archivos permitidos.",
                'LIMIT_FIELD_KEY': "El nombre de uno de los campos en la solicitud es demasiado largo.",
                'LIMIT_FIELD_VALUE': "El valor de uno de los campos en la solicitud es demasiado largo.",
                'LIMIT_FIELD_COUNT': "Se ha excedido el número máximo de campos permitidos en la solicitud."
            };
            const message = errorMessages[err.code] || "Ocurrió un error desconocido al procesar el archivo. Por favor, intenta nuevamente.";
            return res.status(400).json({
                status: 'error',
                message
            });
        }
        if (err) {
            return res.status(400).json({ status: 'error', message: err.message });
        }
        if (options.isRequired && !req.file) {
            return res.status(400).json({ status: 'error', message: 'El archivo es obligatorio' });
        }
        return next();
    });
};

export const singleUpload = (options: uploadOptions) => createUploadMiddleware({ ...options });