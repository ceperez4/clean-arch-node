import { UserRepository } from "@modules/users/domain/userRepository";
import { UserNotFoundError } from "@modules/users/application/errors/user-not-found.error";
import { UserResponseDto } from "@modules/users/application/dtos/user-response.dto";

export class UserGetByIdUseCase {
    constructor(
        private readonly userRepository: UserRepository
    ) { }

    async execute(id: number): Promise<UserResponseDto> {
        const user = await this.userRepository.getOneById(id);
        if (!user) {
            throw new UserNotFoundError(`${id}`)
        }
        return {
            id: user.getId(),
            name: user.getName(),
            email: user.getEmail(),
            createdAt: user.getCreatedAt(),
            photoFilename: user.getPhotoFilename(),
        }
    }
}