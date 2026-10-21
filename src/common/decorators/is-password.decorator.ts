import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export interface IsValidPasswordOptions {
    fieldName?: string;
    minLength?: number;
    maxLength?: number;
}

export function IsValidPassword(options: IsValidPasswordOptions = {}) {
    const fieldName = options.fieldName ?? 'La contraseña';
    const minLength = options.minLength ?? 8;
    const maxLength = options.maxLength ?? 50;

    return applyDecorators(
        IsNotEmpty({ message: `${fieldName} es obligatoria` }),
        IsString({ message: `${fieldName} debe ser un texto` }),
        Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value)),
        MinLength(minLength, {
            message: `${fieldName} debe tener al menos ${minLength} caracteres`,
        }),
        MaxLength(maxLength, {
            message: `${fieldName} no puede exceder los ${maxLength} caracteres`,
        }),
    );
}
