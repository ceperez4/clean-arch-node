import { Body, Controller, Param, Put, UploadedFiles, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import type { ICurrentUser } from 'src/common/interfaces/jwt-payload.interface';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { STATUS_OK } from 'src/common/constants/http.constant';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdatePasswordUserUseCase } from '../../application/update-password-user-use-case/update-password-user.use-case';
import { UpdatePasswordUserDto } from '../../application/update-password-user-use-case/update-password-user.dto';
import { UserIdParamDto } from 'src/common/dtos/user-id-param.dto';
import { FileSize, UploadFiles } from 'src/common/decorators/upload-files.decorator';
import { UploadSecureFilePipe } from 'src/common/pipes/upload-secure-file.pipe';
import type { ISecureFile } from 'src/common/interfaces/files.interface';
import { UpdateProfileUserUseCase } from '../../application/update-profile-user-use-case/update-profile-user.use-case';
import { UpdateProfileUserDto } from '../../application/update-profile-user-use-case/update-profile-user.dto';
import { ApiUploadFile } from 'src/common/decorators/api-swagger.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('users')
export class UserCommandController {
    constructor(
        private readonly updatePasswordUserUseCase: UpdatePasswordUserUseCase,
        private readonly updateProfileUserUseCase: UpdateProfileUserUseCase,
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
}
