import { TransactionalDBConnection } from 'src/common/decorators/db-connection.decorator';
import { CustomInjectable } from 'src/common/decorators/injectable.decorator';
import { IUnitOfWork } from 'src/common/interfaces/unit-of-work.interface';
import { LogoutAuthDto } from './logout-auth.dto';
import { InvalidToken } from '../../domain/entities/invalid-token.entity';
import { IJwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { InvalidTokenRepository } from '../../domain/repositories/invalid-token.repository';
import { IJwtGenerator, JwtClaims } from 'src/common/libs/jwt-generator/jwt-generator.interface';
import { UserRepository } from 'src/contexts/users/domain/repositories/user.repository';
import { ICacheManager } from 'src/common/libs/cache-manager/cache-manager.interface';

@CustomInjectable()
export class LogoutAuthUseCase {
    constructor(
        public readonly uow: IUnitOfWork,
        private readonly invalidTokenRepository: InvalidTokenRepository,
        private readonly userRepository: UserRepository,
        private readonly cacheManager: ICacheManager,
        private readonly tokenGenerator: IJwtGenerator,
    ) {}

    @TransactionalDBConnection()
    async execute(payload: LogoutAuthDto): Promise<void> {
        if (!payload.refreshToken) {
            return;
        }

        const isAlreadyBlacklisted = await this.invalidTokenRepository.isBlackList(payload.refreshToken);
        if (isAlreadyBlacklisted) return;

        let decoded: JwtClaims<IJwtPayload> | null = null;
        let isSignatureValid = false;

        try {
            decoded = this.tokenGenerator.verify<IJwtPayload>(payload.refreshToken, 'refresh', {
                ignoreExpiration: true,
            });
            isSignatureValid = true;
        } catch {
            decoded = this.tokenGenerator.decode<IJwtPayload>(payload.refreshToken);
        }

        if (isSignatureValid && decoded?.sub) {
            const user = await this.userRepository.findOneByCriteria({
                type: 'id',
                value: decoded.sub,
            });
            if (user) {
                await this.userRepository.updateTokenVersion(user.attributes.id, user.attributes.tokenVersion + 1);
                await this.cacheManager.del(`auth_user:${user.attributes.id}`);
            }
        }

        const expirationDate = decoded?.exp
            ? new Date(decoded.exp * 1000)
            : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const entity = InvalidToken.create({
            payload: payload.refreshToken,
            expiration: expirationDate,
        });

        await this.invalidTokenRepository.add(entity);
    }
}
