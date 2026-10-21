import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsJWT, IsOptional, IsString } from 'class-validator';

export class LogoutAuthDto {
    @ApiPropertyOptional({
        description: 'Refresh token JWT a invalidar (opcional si se envía por cookie HttpOnly)',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVC...',
    })
    @IsOptional()
    @IsString({ message: 'El token debe ser un texto' })
    @IsJWT({ message: 'Formato de token incorrecto' })
    @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
    refreshToken?: string;
}
