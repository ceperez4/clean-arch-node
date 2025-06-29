import { UserRepository } from "@modules/users/domain/userRepository";
import { UserNotFoundError } from "@modules/users/application/errors/user-not-found.error";

export class UserDeleteUseCase {
    constructor(
        private readonly userRepository: UserRepository
    ) { }

    async execute(id: number): Promise<void> {
        const user = await this.userRepository.getOneById(id);
        if (!user) {
            throw new UserNotFoundError(`${id}`)
        }
        await this.userRepository.delete(id);
    }
}