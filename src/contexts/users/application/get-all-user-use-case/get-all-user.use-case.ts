import { IUnitOfWork } from 'src/common/interfaces/unit-of-work.interface';
import { GetAllUserDto, GetAllUserResponseDto } from './get-all-user.dto';
import { CustomInjectable } from 'src/common/decorators/injectable.decorator';
import { SimpleDBConnection } from 'src/common/decorators/db-connection.decorator';

import { UserRepository } from '../../domain/repositories/user.repository';

@CustomInjectable()
export class GetAllUserUseCase {
    constructor(
        public readonly uow: IUnitOfWork,
        private readonly userRepository: UserRepository,
    ) {}

    @SimpleDBConnection()
    async execute(payload: GetAllUserDto): Promise<GetAllUserResponseDto> {
        const { data, total, totalPages } = await this.userRepository.findAll(payload);

        return {
            page: payload.page,
            limit: payload.limit,
            total: total,
            totalPages: totalPages,
            data: data.map((entity) => ({
                id: entity.attributes.id,
                name: entity.attributes.name,
                email: entity.attributes.email,
                status: entity.attributes.status,
                role: entity.attributes.role,
            })),
        };
    }
}
