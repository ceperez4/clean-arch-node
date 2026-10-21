import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { IsValidPassword } from 'src/common/decorators/is-password.decorator';

export class RegisterAuthUseDto {
    @ApiProperty({
        description: 'Correo',
        example: 'jhondoe@example.com',
    })
    @IsNotEmpty({ message: 'El correo es obligatorio' })
    @IsString({ message: 'El correo debe ser un texto' })
    @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
    @IsEmail({}, { message: 'Formato de correo incorrecto' })
    @MaxLength(100, { message: 'El correo es demasiado largo' })
    email: string = '';

    @ApiProperty({
        description: 'Contraseña',
        example: '12345678',
    })
    @IsValidPassword()
    password: string = '';

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
    name: string = '';
}

export type RegisterAuthUseResponseDto = {
    accessToken: string;
    refreshToken: string;
    id: number;
    name: string;
    email: string;
    role: string;
};
