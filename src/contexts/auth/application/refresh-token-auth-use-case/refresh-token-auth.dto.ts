import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsJWT, IsOptional, IsString } from 'class-validator';

export class RefreshTokenAuthDto {
    @ApiPropertyOptional({
        description: 'Refresh token JWT (opcional si se envía mediante cookie HttpOnly)',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVC...',
    })
    @IsOptional()
    @IsString({ message: 'El token debe ser un texto' })
    @IsJWT({ message: 'Formato de token incorrecto' })
    @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
    refreshToken?: string;
}

export type RefreshTokenAuthResponseDto = {
    accessToken: string;
    refreshToken: string;
};
