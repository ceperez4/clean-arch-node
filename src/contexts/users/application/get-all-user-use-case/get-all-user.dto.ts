import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationResponseDto, PaginationValidationDto } from 'src/common/dtos/pagination.dto';
import { UserRoleEnum, UserStatusEnum } from 'src/common/enums/user.enum';

export class GetAllUserDto extends PaginationValidationDto {
    @ApiProperty({
        description: 'Estado usuario',
        enum: UserStatusEnum,
        required: false,
    })
    @IsOptional()
    @IsEnum(UserStatusEnum, { message: 'El estado ingresado no es válido' })
    status?: UserStatusEnum;

    @ApiProperty({
        description: 'Rol usuario',
        enum: UserRoleEnum,
        required: false,
    })
    @IsOptional()
    @IsEnum(UserRoleEnum, { message: 'El rol ingresado no es válido' })
    role?: UserRoleEnum;
}

export type GetAllUserResponseDto = PaginationResponseDto<{
    id: number;
    name: string;
    email: string;
    status: string;
    role: string;
}>;
