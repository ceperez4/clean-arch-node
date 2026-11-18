import { Body, Controller, Ip, Param, Put, UploadedFiles, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import type { ICurrentUser } from 'src/common/interfaces/jwt-payload.interface';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { STATUS_OK } from 'src/common/constants/http.constant';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdatePasswordUserUseCase } from '../../application/use-cases/update-password-user-use-case/update-password-user.use-case';
import { UpdatePasswordUserDto } from '../../application/use-cases/update-password-user-use-case/update-password-user.dto';
import { UserIdParamDto } from 'src/common/dtos/user-id-param.dto';
import { FileSize, UploadFiles } from 'src/common/decorators/upload-files.decorator';
import { UploadSecureFilePipe } from 'src/common/pipes/upload-secure-file.pipe';
import type { ISecureFile } from 'src/common/interfaces/files.interface';
import { UpdateProfileUserUseCase } from '../../application/use-cases/update-profile-user-use-case/update-profile-user.use-case';
import { UpdateProfileUserDto } from '../../application/use-cases/update-profile-user-use-case/update-profile-user.dto';
import { ApiUploadFile } from 'src/common/decorators/api-swagger.decorator';
import { ToggleTwoFactorUserDto } from '../../application/use-cases/toggle-two-factor-user-use-case/toggle-two-factor-user.dto';
import { ToggleTwoFactorUserUseCase } from '../../application/use-cases/toggle-two-factor-user-use-case/toggle-two-factor-user.use-case';
import { ChangeStatusUserDto } from '../../application/use-cases/change-status-user-use-case/change-status-user.dto';
import { ChangeStatusUserUseCase } from '../../application/use-cases/change-status-user-use-case/change-status-user.use-case';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRoleEnum } from 'src/common/enums/user.enum';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('users')
export class UserCommandController {
    constructor(
        private readonly updatePasswordUserUseCase: UpdatePasswordUserUseCase,
        private readonly updateProfileUserUseCase: UpdateProfileUserUseCase,
        private readonly toggleTwoFactorUserUseCase: ToggleTwoFactorUserUseCase,
        private readonly changeStatusUserUseCase: ChangeStatusUserUseCase,
    ) {}

    /************************************************ */
    /************************************************ */
    @ApiOperation({ summary: 'Cambiar contraseña' })
    @Put('/:userId/pass')
    async updatePassword(
        @Body() body: UpdatePasswordUserDto,
        @Param() param: UserIdParamDto,
        @CurrentUser() user: ICurrentUser,
    ) {
        const data = await this.updatePasswordUserUseCase.execute(param.userId, body, user);
        return {
            status: STATUS_OK,
            message: 'Contraseña actualizada correctamente',
            data: data,
        };
    }

    /************************************************ */
    /************************************************ */
    @ApiOperation({ summary: 'Actualizar perfil' })
    @ApiUploadFile(UpdateProfileUserDto, 'file')
    @Put('/:userId/profile')
    @UploadFiles('file', FileSize['5_MB'], 1)
    async updateProfile(
        @UploadedFiles(new UploadSecureFilePipe()) files: ISecureFile[],
        @Param() param: UserIdParamDto,
        @Body() body: UpdateProfileUserDto,
        @CurrentUser() user: ICurrentUser,
    ) {
        await this.updateProfileUserUseCase.execute(param.userId, body, files, user);
        return { status: STATUS_OK, message: 'Datos actualizados correctamente' };
    }

    /************************************************ */
    /************************************************ */
    @ApiOperation({ summary: 'Activar o desactivar autenticación en dos pasos (2FA)' })
    @Put('/:userId/2fa')
    async toggleTwoFactor(
        @Body() body: ToggleTwoFactorUserDto,
        @Param() param: UserIdParamDto,
        @CurrentUser() user: ICurrentUser,
    ) {
        await this.toggleTwoFactorUserUseCase.execute(param.userId, body, user);
        return {
            status: STATUS_OK,
            message: body.enabled ? '2FA habilitado correctamente' : '2FA deshabilitado correctamente',
        };
    }

    /************************************************ */
    /************************************************ */
    @ApiOperation({ summary: 'Cambiar estado de un usuario (Solo Administradores)' })
    @Roles(UserRoleEnum.ADMIN)
    @Put('/:userId/status')
    async changeStatus(
        @Param() param: UserIdParamDto,
        @Body() body: ChangeStatusUserDto,
        @CurrentUser() user: ICurrentUser,
        @Ip() ip: string,
    ) {
        const data = await this.changeStatusUserUseCase.execute(param.userId, body, user, ip);
        return {
            status: STATUS_OK,
            message: 'Estado del usuario actualizado correctamente',
            data,
        };
    }
}
