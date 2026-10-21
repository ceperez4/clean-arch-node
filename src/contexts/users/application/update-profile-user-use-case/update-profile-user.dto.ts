import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileUserDto {
    @ApiProperty({
        description: 'Nombres',
        example: 'Jhon Doe',
    })
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    @IsString({ message: 'El nombre debe ser un texto' })
    @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
    @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, {
        message: 'El nombre solo puede contener letras y espacios',
    })
    @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    @MaxLength(60, { message: 'El nombre no puede exceder los 60 caracteres' })
    name?: string = '';
}
