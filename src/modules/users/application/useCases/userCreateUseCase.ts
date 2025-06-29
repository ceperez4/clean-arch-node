import { IPasswordHasher } from "@/modules/shared/domain/services/iPasswordHasher";
import { UserRepository } from "@modules/users/domain/userRepository";
import { UserResponseDto } from "@modules/users/application/dtos/user-response.dto";
import { UserAlreadyExistsError } from "@modules/users/application/errors/user-already-exists.error";
import { User } from "@modules/users/domain/user";


export class UserCreateUseCase {
    constructor(
        readonly userRepository: UserRepository,
        readonly passwordHasher: IPasswordHasher
    ) { }

    async execute({
        name, email, password, photoFilename
    }: {
        name: string,
        email: string,
        password: string,
        photoFilename: string | null
    }): Promise<UserResponseDto> {
        const userExist = await this.userRepository.getOneByEmail(email);
        if (userExist) {
            throw new UserAlreadyExistsError(email);
        }

        const passwordHashed = await this.passwordHasher.hash(password);

        const user = await this.userRepository.create(User.create({
            name: name,
            email: email,
            password: passwordHashed,
            photoFilename: photoFilename,
        }));

        return {
            id: user.getId(),
            name: user.getName(),
            email: user.getEmail(),
            photoFilename: user.getPhotoFilename(),
            createdAt: user.getCreatedAt()
        };
    }
}