import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { AuditResourceEnum } from 'src/common/enums/audit.enum';

export class GetAuditLogsParamDto {
    @ApiProperty({
        description: 'Nombre del recurso auditado',
        enum: AuditResourceEnum,
        example: AuditResourceEnum.USER,
    })
    @IsEnum(AuditResourceEnum, {
        message: 'El estado debe ser ACTIVO o INACTIVO',
    })
    resource: AuditResourceEnum;

    @ApiProperty({
        description: 'Identificador del recurso auditado (ej. ID de usuario)',
        example: '1',
    })
    @IsNotEmpty({ message: 'El resourceId no puede estar vacío' })
    @IsString()
    resourceId: string = '';
}

export interface AuditLogItemResponseDto {
    id: number;
    resource: string;
    resourceId: string;
    action: string;
    actorId: number | null;
    beforeState: Record<string, unknown> | null;
    afterState: Record<string, unknown> | null;
    ip: string;
    createdAt: Date;
}
