import { IsInt, IsOptional, IsPositive, IsString, IsIn, Matches, Validate, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

interface DateRangeObject {
    startDate?: string;
    endDate?: string;
}

@ValidatorConstraint({ name: 'DateRangeValidator', async: false })
export class DateRangeValidator implements ValidatorConstraintInterface {
    validate(_: unknown, args: ValidationArguments) {
        const obj = args.object as DateRangeObject;
        const { startDate, endDate } = obj;

        if (startDate && !endDate) return false;
        if (endDate && !startDate) return false;
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) return false;

        return true;
    }

    defaultMessage(args: ValidationArguments) {
        const obj = args.object as DateRangeObject;
        if (obj.startDate && !obj.endDate) {
            return 'Si se especifica una fecha de inicio, la fecha de fin también es obligatoria.';
        }
        if (obj.endDate && !obj.startDate) {
            return 'Si se especifica una fecha de fin, la fecha de inicio también es obligatoria.';
        }
        if (obj.startDate && obj.endDate && new Date(obj.startDate) > new Date(obj.endDate)) {
            return 'La fecha de inicio no puede ser posterior a la fecha de fin.';
        }
        return '';
    }
}

export class PaginationValidationDto {
    @ApiProperty({
        description: 'Página',
        example: 1,
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'La página debe ser un número entero' })
    @IsPositive({ message: 'La página debe ser un número positivo' })
    page: number = 1;

    @ApiProperty({
        description: 'Limite',
        example: 10,
        required: false,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'El límite debe ser un número entero' })
    @IsPositive({ message: 'El límite debe ser un número positivo' })
    limit: number = 10;

    @ApiProperty({
        description: 'Busqueda',
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'La búsqueda debe ser un texto' })
    @MaxLength(100, {
        message: 'No se permiten mas de 100 caracteres en la busqueda',
    })
    search?: string;

    @ApiProperty({
        description: 'Fecha de inicio yyyy-mm-dd',
        required: false,
    })
    @IsOptional()
    @IsString({
        message: 'Debe ingresar una fecha de inicio válida con el siguiente formato: yyyy-mm-dd',
    })
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'La fecha de inicio debe tener el formato yyyy-mm-dd',
    })
    startDate?: string;

    @ApiProperty({
        description: 'Fecha de fin yyyy-mm-dd',
        example: '',
        required: false,
    })
    @IsOptional()
    @IsString({
        message: 'Debe ingresar una fecha de fin válida con el siguiente formato: yyyy-mm-dd',
    })
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'La fecha de fin debe tener el formato yyyy-mm-dd',
    })
    endDate?: string;

    @ApiProperty({
        description: 'Ordenar por',
        example: '',
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'El parámetro sortBy debe ser texto' })
    sortBy?: string;

    @ApiProperty({
        description: 'Tipo de orden',
        enum: ['ASC', 'DESC'],
        required: false,
    })
    @IsOptional()
    @IsIn(['ASC', 'DESC'], {
        message: 'El parámetro sortOrder solo permite los valores: "ASC" o "DESC"',
    })
    sortOrder?: 'ASC' | 'DESC';

    @Validate(DateRangeValidator)
    validateRange?: boolean;
}

export type PaginationResponseDto<T> = {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
    data: T[];
};
