import crypto from 'node:crypto';
import path from 'node:path';
import multer from 'multer';
import { envs } from '@/config/envs';

const createDiskStorage = (destinationPath: string, filenamePrefix = '') => multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, destinationPath);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${filenamePrefix}${crypto.randomUUID()}${ext}`);
    },
});

export const usersStorage = createDiskStorage(envs.pathUserFiles);