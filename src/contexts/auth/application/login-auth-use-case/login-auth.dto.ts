import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginAuthDto {
    @ApiProperty({
        description: 'Correo',
        example: 'jhondoe@example.com',
    })
    @IsNotEmpty({ message: 'El correo es obligatorio' })
    @IsString({ message: 'El correo debe ser un texto' })
    @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
    @IsEmail({}, { message: 'Formato de correo incorrecto' })
    email: string = '';

    @ApiProperty({
        description: 'Contraseña',
        example: '12345678',
    })
    @IsNotEmpty({ message: 'La contraseña es obligatoria' })
    @IsString({ message: 'La contraseña debe ser un texto' })
    @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
    password: string = '';
}

export type LoginAuthResponseDto = {
    accessToken: string;
    refreshToken: string;
    id: number;
    name: string;
    email: string;
    role: string;
    avatar: string;
};
