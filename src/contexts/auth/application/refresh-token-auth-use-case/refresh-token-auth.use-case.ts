import { TransactionalDBConnection } from 'src/common/decorators/db-connection.decorator';
import { CustomInjectable } from 'src/common/decorators/injectable.decorator';
import { IUnitOfWork } from 'src/common/interfaces/unit-of-work.interface';
import { RefreshTokenAuthDto, RefreshTokenAuthResponseDto } from './refresh-token-auth.dto';
import { UnauthorizedError } from 'src/common/errors/unauthorized.error';
import { IJwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { InvalidToken } from '../../domain/entities/invalid-token.entity';
import { UserStatusEnum } from 'src/common/enums/user.enum';
import { UserRepository } from 'src/contexts/users/domain/repositories/user.repository';
import { InvalidTokenRepository } from '../../domain/repositories/invalid-token.repository';
import { IJwtGenerator } from 'src/common/libs/jwt-generator/jwt-generator.interface';

@CustomInjectable()
export class RefreshTokenAuthUseCase {
    constructor(
        public readonly uow: IUnitOfWork,
        private readonly userRepository: UserRepository,
        private readonly invalidTokenRepository: InvalidTokenRepository,
        private readonly tokenGenerator: IJwtGenerator,
    ) {}

    @TransactionalDBConnection()
    async execute(payload: RefreshTokenAuthDto): Promise<RefreshTokenAuthResponseDto> {
        if (!payload.refreshToken) {
            throw new UnauthorizedError('No se proporcionó un token de refresco');
        }

        const exist = await this.invalidTokenRepository.isBlackList(payload.refreshToken);

        if (exist) throw new UnauthorizedError('El token se encuentra en la lista negra');

        const data = this.tokenGenerator.verify<IJwtPayload>(payload.refreshToken, 'refresh');

        const user = await this.userRepository.findOneByCriteria({
            type: 'id',
            value: data.sub,
        });

        if (!user) {
            throw new UnauthorizedError('Usuario no encontrado o no válido');
        }

        if (user.attributes.status !== UserStatusEnum.ACTIVE) {
            throw new UnauthorizedError('La cuenta de usuario se encuentra inactiva o suspendida');
        }

        // Validar versión del token
        if (data.tokenVersion !== user.attributes.tokenVersion) {
            throw new UnauthorizedError('El token de sesión ha sido revocado o ya no es válido');
        }

        // Generar nuevos tokens con datos actualizados del usuario
        const newTokenData: IJwtPayload = {
            sub: user.attributes.id,
            name: user.attributes.name,
            email: user.attributes.email,
            tokenVersion: user.attributes.tokenVersion,
            role: user.attributes.role,
        };
        const accessToken = this.tokenGenerator.sign<IJwtPayload>(newTokenData, 'access');
        const refreshToken = this.tokenGenerator.sign<IJwtPayload>(newTokenData, 'refresh');

        const expirationDate = data.exp ? new Date(data.exp * 1000) : new Date();
        const entity: InvalidToken = InvalidToken.create({
            payload: payload.refreshToken,
            expiration: expirationDate,
        });

        await this.invalidTokenRepository.add(entity);

        return {
            accessToken: accessToken,
            refreshToken: refreshToken,
        };
    }
}
