import { UserRepository } from "@modules/users/domain/userRepository";
import { UserResponseDto } from "@modules/users/application/dtos/user-response.dto";

export class UserGetAllUseCase {
    constructor(
        readonly userRepository: UserRepository,
    ) { }

    async execute(): Promise<UserResponseDto[]> {
        const users = await this.userRepository.getAll();
        return users.map<UserResponseDto>(user => {
            return {
                id: user.getId(),
                name: user.getName(),
                email: user.getEmail(),
                photoFilename: user.getPhotoFilename(),
                createdAt: user.getCreatedAt()
            }
        });
    }

}