import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ToggleTwoFactorUserDto {
    @ApiProperty({ description: 'Habilitar o deshabilitar 2FA', example: true })
    @IsNotEmpty({ message: 'El estado es requerido' })
    @IsBoolean({ message: 'El estado debe ser booleano' })
    enabled: boolean = false;
}
