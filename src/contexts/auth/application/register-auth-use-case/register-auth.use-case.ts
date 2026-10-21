import { TransactionalDBConnection } from 'src/common/decorators/db-connection.decorator';
import { CustomInjectable } from 'src/common/decorators/injectable.decorator';
import { IUnitOfWork } from 'src/common/interfaces/unit-of-work.interface';
import { RegisterAuthUseDto, RegisterAuthUseResponseDto } from './register-auth.dto';
import { ValidationError } from 'src/common/errors/validation.error';
import { User } from 'src/contexts/users/domain/entities/user.entity';
import { IJwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { UserOauthEnum, UserRoleEnum, UserStatusEnum } from 'src/common/enums/user.enum';
import { UserRepository } from 'src/contexts/users/domain/repositories/user.repository';
import { IPasswordHasher } from 'src/common/libs/password-hasher/password-hasher.interface';
import { IJwtGenerator } from 'src/common/libs/jwt-generator/jwt-generator.interface';

@CustomInjectable()
export class RegisterAuthUseCase {
    constructor(
        public readonly uow: IUnitOfWork,
        private readonly userRepository: UserRepository,
        private readonly passwordHasher: IPasswordHasher,
        private readonly tokenGenerator: IJwtGenerator,
    ) {}

    @TransactionalDBConnection()
    async execute(payload: RegisterAuthUseDto): Promise<RegisterAuthUseResponseDto> {
        const exist = await this.userRepository.findOneByCriteria({
            type: 'email',
            value: payload.email,
        });
        if (exist) throw new ValidationError('El correo ya se encuentra registrado');

        const passHash = await this.passwordHasher.hash(payload.password);

        const user = await this.userRepository.save(
            User.create({
                name: payload.name,
                email: payload.email,
                role: UserRoleEnum.USER,
                password: passHash,
                oauth: UserOauthEnum.MANUAL,
                status: UserStatusEnum.ACTIVE,
                avatar: '',
            }),
        );

        const data: IJwtPayload = {
            sub: user.attributes.id,
            name: user.attributes.name,
            tokenVersion: user.attributes.tokenVersion,
            email: user.attributes.email,
            role: user.attributes.role,
        };

        //generar token y refresh token
        const accessToken = this.tokenGenerator.sign<IJwtPayload>(data, 'access');
        const refreshToken = this.tokenGenerator.sign<IJwtPayload>(data, 'refresh');

        return {
            accessToken: accessToken,
            refreshToken: refreshToken,
            email: user.attributes.email,
            id: user.attributes.id,
            name: user.attributes.name,
            role: user.attributes.role,
        };
    }
}
