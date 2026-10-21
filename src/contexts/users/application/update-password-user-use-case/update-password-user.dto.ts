import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsValidPassword } from 'src/common/decorators/is-password.decorator';

export class UpdatePasswordUserDto {
    @ApiProperty({
        description: 'Contraseña actual',
        example: '1234A@',
    })
    @IsNotEmpty({ message: 'La contraseña actual es obligatoria' })
    @IsString({ message: 'La contraseña actual debe ser un texto' })
    @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
    currentPassword: string = '';

    @ApiProperty({
        description: 'Nueva contraseña',
        example: '5678A@12',
    })
    @IsValidPassword({ fieldName: 'La nueva contraseña' })
    newPassword: string = '';
}

export type UpdatePasswordUserResponseDto = {
    accessToken: string;
    refreshToken: string;
};
