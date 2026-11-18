import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRoleEnum } from 'src/common/enums/user.enum';
import { STATUS_OK } from 'src/common/constants/http.constant';
import { GetAuditLogsParamDto } from '../../application/use-cases/get-audit-logs-use-case/get-audit-logs.dto';
import { GetAuditLogsUseCase } from '../../application/use-cases/get-audit-logs-use-case/get-audit-logs.use-case';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('audit-logs')
export class AuditQueryController {
    constructor(private readonly getAuditLogsUseCase: GetAuditLogsUseCase) {}

    @ApiOperation({ summary: 'Consultar pistas de auditoría de un recurso (Solo Administradores)' })
    @Roles(UserRoleEnum.ADMIN)
    @Get('/:resource/:resourceId')
    async getLogsByResource(@Param() param: GetAuditLogsParamDto) {
        const data = await this.getAuditLogsUseCase.execute(param);
        return {
            status: STATUS_OK,
            data,
        };
    }
}
