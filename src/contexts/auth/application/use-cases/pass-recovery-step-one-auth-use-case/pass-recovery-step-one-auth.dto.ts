import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class PassRecoveryStepOneAuthDto {
    @ApiProperty({
        description: 'Correo',
        example: 'jhondoe@example.com',
    })
    @IsNotEmpty({ message: 'El campo email es obligatorio' })
    @IsString({ message: 'El usuario debe ser un texto' })
    @IsEmail({}, { message: 'El correo ingreso tiene un formato incorrecto' })
    email: string = '';
}
