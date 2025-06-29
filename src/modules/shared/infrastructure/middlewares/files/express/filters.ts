import { Request } from "express";
import { FileFilterCallback } from "multer"

export const imageFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const fileTypes = ["image/png", "image/jpg", "image/jpeg", "image/gif",'image/webp'];
    if (fileTypes.includes(file.mimetype)) {
        return cb(null, true);
    }
    return cb(new Error('Only .png, .jpg, .jpeg, .gif types are supported.'));
};