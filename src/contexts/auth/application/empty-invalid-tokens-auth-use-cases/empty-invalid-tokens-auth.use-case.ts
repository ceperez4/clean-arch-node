import { SimpleDBConnection } from 'src/common/decorators/db-connection.decorator';
import { CustomInjectable } from 'src/common/decorators/injectable.decorator';
import { IUnitOfWork } from 'src/common/interfaces/unit-of-work.interface';
import { InvalidTokenRepository } from '../../domain/repositories/invalid-token.repository';

@CustomInjectable()
export class EmptyInvalidTokensAuthUseCase {
    constructor(
        public readonly uow: IUnitOfWork,
        private readonly invalidTokenRepository: InvalidTokenRepository,
    ) {}

    @SimpleDBConnection()
    async execute() {
        const date = new Date();

        await this.invalidTokenRepository.emptyExpired(date);

        return;
    }
}
