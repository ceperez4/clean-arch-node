import fsAsync, { constants } from 'node:fs/promises';
import fs from 'node:fs';
import path from 'node:path';

export class FileSystemService {

    async createFolderAsync(directoryPath: string): Promise<void> {
        try {
            const fullPath = path.resolve(directoryPath);
            await fsAsync.access(fullPath, constants.W_OK);
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                await fsAsync.mkdir(directoryPath, { recursive: true });
            } else {
                console.error(`Error accessing or creating folder ${directoryPath}:`, error);
                throw error;
            }
        }
    }

    async deleteFileAsync(filePath: string): Promise<void> {
        try {
            await fsAsync.access(filePath, constants.W_OK);
            await fsAsync.unlink(filePath);
        } catch (error: any) {
            if (error.code !== 'ENOENT') {
                console.error(`Error deleting file: ${filePath}`, error);
                //throw error;
            }
        }
    }

    deleteFile(filePath: string): void {
        try {
            fs.accessSync(filePath, constants.W_OK);
            fs.unlinkSync(filePath);
        } catch (error: any) {
            if (error.code !== 'ENOENT') {
                console.error(`Error deleting file: ${filePath}`, error);
                //throw error;
            }
        }
    }
}