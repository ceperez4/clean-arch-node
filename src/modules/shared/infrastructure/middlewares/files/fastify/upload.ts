import { FastifyReply, FastifyRequest } from "fastify";
import { fastifySaveFileToDisk } from "./storage";

interface uploadOptions {
    field: string;
    fileSize: number;
    fileStoragePath: string;
    filter: (mimetype: string) => boolean;
    isRequired: boolean;
}

export const fastifySingleUpload = (options: uploadOptions) => {
    return async function (request: FastifyRequest, reply: FastifyReply) {
        const parts = request.parts();
        let uploadedFile = null;
        const bodyData: Record<string, any> = {}; // Objeto para recolectar los campos de texto

        for await (const part of parts) {
            if (part.type === 'file' && part.fieldname === options.field) {
                if (!options.filter(part.mimetype)) {
                    return reply.status(400).send({ status: 'error', message: 'Tipo de archivo no permitido.' });
                }

                try {
                    uploadedFile = await fastifySaveFileToDisk(part, options.fileStoragePath);
                } catch (err) {
                    return reply.status(500).send({ status: 'error', message: 'Error guardando archivo.' });
                }
            } else if (part.type === 'field') {
                // Recolectar los campos de texto
                bodyData[part.fieldname] = part.value;
            }
        }

        if (options.isRequired && !uploadedFile) {
            return reply.status(400).send({ status: 'error', message: 'El archivo es obligatorio.' });
        }

        // Inyectamos el archivo al request como en Multer
        (request as any).file = uploadedFile;
        (request as any).body = bodyData;
        return true; // para continuar con el handler
    };
};