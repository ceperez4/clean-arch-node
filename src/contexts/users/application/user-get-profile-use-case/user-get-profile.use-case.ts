import { SimpleDBConnection } from 'src/common/decorators/db-connection.decorator';
import { IUnitOfWork } from 'src/common/interfaces/unit-of-work.interface';
import { UserGetProfileDto, UserGetProfileResponseDto } from './user-get-profile.dto';
import { NotFoundError } from 'src/common/errors/not-found.error';
import { CustomInjectable } from 'src/common/decorators/injectable.decorator';
import type { ICurrentUser } from 'src/common/interfaces/jwt-payload.interface';
import { UnauthorizedError } from 'src/common/errors/unauthorized.error';
import { UserRepository } from '../../domain/repositories/user.repository';
import { FileStorageEnum, IFileStorage } from 'src/common/libs/files-storage/file-storage.interface';

@CustomInjectable()
export class UserGetProfileUseCase {
    constructor(
        public readonly uow: IUnitOfWork,
        private readonly userRepository: UserRepository,
        private readonly fileStorage: IFileStorage,
    ) {}

    @SimpleDBConnection()
    async execute(payload: UserGetProfileDto, currentUser: ICurrentUser): Promise<UserGetProfileResponseDto> {
        if (!currentUser.isAdmin()) {
            if (payload.id !== currentUser.id) throw new UnauthorizedError('No puede ver el perfil de otro usuario');
        }

        const user = await this.userRepository.findOneByCriteria({
            type: 'id',
            value: payload.id,
        });
        if (!user) throw new NotFoundError('Usuario no encontrado');
        const avatarUrl = this.fileStorage.url(user.attributes.avatar, FileStorageEnum.AVATAR);
        return {
            id: user.attributes.id,
            name: user.attributes.name,
            email: user.attributes.email,
            oauth: user.attributes.oauth,
            avatar: avatarUrl ?? '',
        };
    }
}
