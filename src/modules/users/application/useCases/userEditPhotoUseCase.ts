import { User } from "@modules/users/domain/user";
import { UserRepository } from "@modules/users/domain/userRepository";
import { UserNotFoundError } from "@modules/users/application/errors/user-not-found.error";

export class UserEditPhotoUseCase {
    constructor(
        private readonly userRepository: UserRepository
    ) { }

    async execute(data: { id: number, photoFilename: string }): Promise<string | null> {
        const user = await this.userRepository.getOneById(data.id);
        if (!user) throw new UserNotFoundError(String(data.id));

        await this.userRepository.edit(new User({
            id: user.getId(),
            name: user.getName(),
            email: user.getEmail(),
            password: user.getPassword(),
            createdAt: user.getCreatedAt(),
            photoFilename: data.photoFilename,
        }));

        return user.getPhotoFilename();
    }
}