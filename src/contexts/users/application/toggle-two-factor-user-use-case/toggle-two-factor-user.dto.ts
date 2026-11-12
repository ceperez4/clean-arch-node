import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ToggleTwoFactorUserDto {
    @ApiProperty({ description: 'Habilitar o deshabilitar 2FA', example: true })
    @IsNotEmpty({ message: 'El estado es requerido' })
    @IsBoolean({ message: 'El estado debe ser booleano' })
    enabled: boolean = false;

    @ApiProperty({
        description: 'Contraseña actual (requerida para usuarios con autenticación manual)',
        required: false,
        example: 'MiContraseñaSegura123',
    })
    @IsOptional()
    @IsString({ message: 'La contraseña actual debe ser un texto' })
    currentPassword?: string;
}
