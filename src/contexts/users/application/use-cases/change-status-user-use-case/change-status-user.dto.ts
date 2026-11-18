import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UserStatusEnum } from 'src/common/enums/user.enum';

export class ChangeStatusUserDto {
    @ApiProperty({
        description: 'Nuevo estado asignado al usuario',
        enum: UserStatusEnum,
        example: UserStatusEnum.INACTIVE,
    })
    @IsEnum(UserStatusEnum, {
        message: 'El estado debe ser ACTIVO o INACTIVO',
    })
    status: UserStatusEnum;
}

export interface ChangeStatusUserResponseDto {
    id: number;
    status: UserStatusEnum;
}
