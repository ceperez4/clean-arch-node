import { applyDecorators, Type } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiProperty } from '@nestjs/swagger';

export interface IApiUploadFileOptions {
    fieldName?: string;
    isMultiple?: boolean;
    required?: boolean;
}

class EmptyUploadDto {}

/**
 * Decorador para documentar endpoints multipart/form-data en Swagger
 * @param bodyDto Clase DTO base con los campos del formulario (puede ser opcional)
 * @param fieldNameOrOptions Nombre del campo o configuración de subida
 * @param isMultiple Indica si se permite subir uno o múltiples archivos (por defecto false)
 */
export function ApiUploadFile(
    bodyDto?: Type<unknown> | null,
    fieldNameOrOptions: string | IApiUploadFileOptions = 'file',
    isMultiple: boolean = false,
) {
    const fieldName =
        typeof fieldNameOrOptions === 'string' ? fieldNameOrOptions : (fieldNameOrOptions.fieldName ?? 'file');
    const multiple = typeof fieldNameOrOptions === 'object' ? (fieldNameOrOptions.isMultiple ?? false) : isMultiple;
    const required = typeof fieldNameOrOptions === 'object' ? (fieldNameOrOptions.required ?? false) : false;

    const TargetBaseDto = (bodyDto ?? EmptyUploadDto) as Type<Record<string, unknown>>;

    // Generar un nombre de clase dinámico único para evitar colisiones de esquema en Swagger
    const uniqueClassName = `${TargetBaseDto.name || 'Anonymous'}_${fieldName}_${multiple ? 'Multiple' : 'Single'}_UploadDto`;

    const NamedUploadDto = {
        [uniqueClassName]: class extends (bodyDto as Type<Record<string, unknown>>) {},
    }[uniqueClassName];

    if (multiple) {
        ApiProperty({
            type: 'array',
            items: {
                type: 'string',
                format: 'binary',
            },
            required: required,
            description: 'Archivos adjuntos',
        })(NamedUploadDto.prototype, fieldName);
    } else {
        ApiProperty({
            type: 'string',
            format: 'binary',
            required: required,
            description: 'Archivo adjunto',
        })(NamedUploadDto.prototype, fieldName);
    }

    return applyDecorators(
        ApiConsumes('multipart/form-data'),
        ApiBody({
            type: NamedUploadDto,
        }),
    );
}
