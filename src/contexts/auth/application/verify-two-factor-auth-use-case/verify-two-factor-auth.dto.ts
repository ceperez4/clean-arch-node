import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyTwoFactorAuthDto {
    @ApiProperty({ description: 'Token temporal emitido en el paso 1 de login' })
    @IsNotEmpty({ message: 'El token temporal es requerido' })
    @IsString()
    tempToken: string = '';

    @ApiProperty({ description: 'Código OTP de 6 dígitos recibido por correo', example: '123456' })
    @IsNotEmpty({ message: 'El código es requerido' })
    @IsString()
    @Length(6, 6, { message: 'El código debe tener 6 dígitos' })
    otp: string = '';
}

export interface VerifyTwoFactorResponseDto {
    accessToken: string;
    refreshToken: string;
    id: number;
    name: string;
    email: string;
    role: string;
    avatar: string;
}
