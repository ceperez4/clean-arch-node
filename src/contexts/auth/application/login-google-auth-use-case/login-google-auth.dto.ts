import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginGoogleAuthDto {
    @ApiProperty({
        description: 'Token google',
        example: 'mnfknqladorsd...',
    })
    @IsNotEmpty({ message: 'Token obligatorio' })
    @IsString({ message: 'EL token debe ser un texto' })
    @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
    token: string = '';

    name: string = '';

    email: string = '';

    expiration?: number;
}

export type LoginGoogleAuthResponseDto = {
    accessToken: string;
    refreshToken: string;
    id: number;
    name: string;
    email: string;
    role: string;
    avatar: string;
};
