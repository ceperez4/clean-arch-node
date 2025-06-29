import { join } from "node:path";
import fs from "node:fs";

export const fastifySaveFileToDisk = async (file: any, destinationPath: string, filenamePrefix = '') => {
  const ext = file.filename ? file.filename.split('.').pop() : 'png';
  const filename = `${filenamePrefix}${crypto.randomUUID()}.${ext}`;
  const filePath = join(destinationPath, filename);

  await fs.promises.mkdir(destinationPath, { recursive: true });
  const writeStream = fs.createWriteStream(filePath);

  await file.file.pipe(writeStream);

  return { path: filePath, filename };
};