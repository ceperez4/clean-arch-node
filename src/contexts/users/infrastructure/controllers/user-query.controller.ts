import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { UserGetProfileDto } from '../../application/user-get-profile-use-case/user-get-profile.dto';
import type { ICurrentUser } from 'src/common/interfaces/jwt-payload.interface';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserRoleEnum } from 'src/common/enums/user.enum';
import { UserGetProfileUseCase } from '../../application/user-get-profile-use-case/user-get-profile.use-case';
import { STATUS_OK } from 'src/common/constants/http.constant';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetAllUserUseCase } from '../../application/get-all-user-use-case/get-all-user.use-case';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GetAllUserDto } from '../../application/get-all-user-use-case/get-all-user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('users')
export class UserQueryController {
    constructor(
        private readonly userGetProfileUseCase: UserGetProfileUseCase,
        private readonly getAllUserUseCase: GetAllUserUseCase,
    ) {}

    /************************************************ */
    /************************************************ */
    @ApiOperation({ summary: 'Obtener perfil' })
    @Get('/:id/profile')
    async getProfile(@Param() param: UserGetProfileDto, @CurrentUser() user: ICurrentUser) {
        const data = await this.userGetProfileUseCase.execute(param, user);
        return {
            status: STATUS_OK,
            message: 'Datos consultados correctamente',
            data: data,
        };
    }

    /************************************************ */
    /************************************************ */
    @ApiOperation({ summary: 'Listar todos los usuarios (ADMIN)' })
    @Get('/')
    @Roles(UserRoleEnum.ADMIN)
    async getAll(@Query() query: GetAllUserDto) {
        const data = await this.getAllUserUseCase.execute(query);
        return {
            status: STATUS_OK,
            message: 'Datos consultados correctamente',
            data: data,
        };
    }
}
