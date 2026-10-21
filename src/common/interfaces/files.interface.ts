export interface ISecureFile {
    originalName: string;
    filename: string;
    mimetype: string;
    extension: string;
    size: number;
    buffer: Buffer;
}
