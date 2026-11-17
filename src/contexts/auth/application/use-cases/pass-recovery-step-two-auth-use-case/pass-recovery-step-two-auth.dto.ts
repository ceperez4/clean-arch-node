import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { IsValidPassword } from 'src/common/decorators/is-password.decorator';

export class PassRecoveryStepTwoAuthDto {
    @ApiProperty({
        description: 'Correo',
        example: 'jhondoe@example.com',
    })
    @IsNotEmpty({ message: 'El campo email es obligatorio' })
    @IsString({ message: 'El usuario debe ser un texto' })
    @IsEmail({}, { message: 'El correo ingreso tiene un formato incorrecto' })
    email: string = '';

    @ApiProperty({
        description: 'Código OTP',
        example: '13rU4',
    })
    @IsNotEmpty({ message: 'El código otp es obligatorio' })
    @IsString({ message: 'El código otp debe ser un texto' })
    @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
    @MaxLength(5, { message: 'El código otp debe tener 5 caracteres' })
    @MinLength(5, { message: 'El código otp debe tener 5 caracteres' })
    otp: string = '';

    @ApiProperty({
        description: 'Nueva contraseña',
        example: '12345678A@',
    })
    @IsValidPassword({ fieldName: 'La nueva contraseña' })
    password: string = '';
}
