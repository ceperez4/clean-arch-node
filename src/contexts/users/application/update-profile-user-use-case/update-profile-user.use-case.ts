import { CustomInjectable } from 'src/common/decorators/injectable.decorator';
import { UpdateProfileUserDto } from './update-profile-user.dto';
import { IUnitOfWork } from 'src/common/interfaces/unit-of-work.interface';
import { UnauthorizedError } from 'src/common/errors/unauthorized.error';
import { TransactionalDBConnection } from 'src/common/decorators/db-connection.decorator';
import type { ISecureFile } from 'src/common/interfaces/files.interface';
import type { ICurrentUser } from 'src/common/interfaces/jwt-payload.interface';
import { NotFoundError } from 'src/common/errors/not-found.error';
import { FileRollback } from 'src/common/decorators/file-rollback.decorator';
import { UserRepository } from '../../domain/repositories/user.repository';
import { FileStorageEnum, IFileStorage } from 'src/common/libs/files-storage/file-storage.interface';
import { ICacheManager } from 'src/common/libs/cache-manager/cache-manager.interface';

@CustomInjectable()
export class UpdateProfileUserUseCase {
    constructor(
        public readonly uow: IUnitOfWork,
        private readonly userRepository: UserRepository,
        private readonly fileStorage: IFileStorage,
        private readonly cacheManager: ICacheManager,
    ) {}

    @FileRollback()
    @TransactionalDBConnection()
    async execute(userId: number, payload: UpdateProfileUserDto, files: ISecureFile[], currentUser: ICurrentUser) {
        if (!currentUser.isAdmin() && userId !== currentUser.id) {
            throw new UnauthorizedError('No tiene permisos para modificar el perfil de este usuario');
        }

        const user = await this.userRepository.findOneByCriteria({
            type: 'id',
            value: userId,
        });
        if (!user) throw new NotFoundError('Usuario no encontrado');

        if (payload.name) user.attributes.name = payload.name;

        let currentAvatar = '';
        if (files.length > 0) {
            currentAvatar = user.attributes.avatar;
            const file = files[0];
            await this.fileStorage.save(file, FileStorageEnum.AVATAR);
            user.attributes.avatar = file.filename;
        }

        await this.userRepository.update(user);
        await this.cacheManager.del(`auth_user:${userId}`);

        if (currentAvatar) {
            try {
                await this.fileStorage.delete(currentAvatar, FileStorageEnum.AVATAR);
            } catch (deleteError) {
                console.error('Error al eliminar avatar anterior:', deleteError);
            }
        }

        return;
    }
}
