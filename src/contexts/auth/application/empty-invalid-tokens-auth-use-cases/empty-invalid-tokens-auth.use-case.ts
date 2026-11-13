import { SimpleDBConnection } from 'src/common/decorators/db-connection.decorator';
import { CustomInjectable } from 'src/common/decorators/injectable.decorator';
import { IUnitOfWork } from 'src/common/interfaces/unit-of-work.interface';
import { InvalidTokenRepository } from '../../domain/repositories/invalid-token.repository';
import { AuthChallengeRepository } from '../../domain/repositories/auth-challenge.repository';

@CustomInjectable()
export class EmptyInvalidTokensAuthUseCase {
    constructor(
        public readonly uow: IUnitOfWork,
        private readonly invalidTokenRepository: InvalidTokenRepository,
        private readonly authChallengeRepository: AuthChallengeRepository,
    ) {}

    @SimpleDBConnection()
    async execute() {
        const date = new Date();

        await Promise.all([
            this.invalidTokenRepository.emptyExpired(date),
            this.authChallengeRepository.deleteExpired(date),
        ]);

        return;
    }
}
