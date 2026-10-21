import { TransactionalDBConnection } from 'src/common/decorators/db-connection.decorator';
import { CustomInjectable } from 'src/common/decorators/injectable.decorator';
import { IUnitOfWork } from 'src/common/interfaces/unit-of-work.interface';
import { LogoutAuthDto } from './logout-auth.dto';
import { InvalidToken } from '../../domain/entities/invalid-token.entity';
import { IJwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { InvalidTokenRepository } from '../../domain/repositories/invalid-token.repository';
import { IJwtGenerator } from 'src/common/libs/jwt-generator/jwt-generator.interface';

@CustomInjectable()
export class LogoutAuthUseCase {
    constructor(
        public readonly uow: IUnitOfWork,
        private readonly invalidTokenRepository: InvalidTokenRepository,
        private readonly tokenGenerator: IJwtGenerator,
    ) {}

    @TransactionalDBConnection()
    async execute(payload: LogoutAuthDto): Promise<void> {
        if (!payload.refreshToken) {
            return;
        }

        const isAlreadyBlacklisted = await this.invalidTokenRepository.isBlackList(payload.refreshToken);
        if (isAlreadyBlacklisted) return;

        const decoded = this.tokenGenerator.decode<IJwtPayload>(payload.refreshToken);
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
