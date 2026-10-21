import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class UserIdParamDto {
    @ApiProperty({
        description: 'ID Usuario',
        example: '1',
    })
    @IsNotEmpty({ message: 'El identificador no puede ser vacio' })
    @Type(() => Number)
    @IsInt({ message: 'El identificador debe ser un número entero' })
    @IsPositive({ message: 'El identificador debe ser un número mayor a 0' })
    userId: number = 0;
}
