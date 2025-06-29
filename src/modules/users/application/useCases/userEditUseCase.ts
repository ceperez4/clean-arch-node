import { User } from "@modules/users/domain/user";
import { UserRepository } from "@modules/users/domain/userRepository";
import { UserAlreadyExistsError } from "@modules/users/application/errors/user-already-exists.error";
import { UserNotFoundError } from "@modules/users/application/errors/user-not-found.error";


export class UserEditUseCase {
    constructor(
        private readonly userRepository: UserRepository
    ) { }

    async execute({
        id, name, email
    }: {
        id: number,
        name: string,
        email: string,
    }) {
        const user = await this.userRepository.getOneById(id);
        if (!user) throw new UserNotFoundError(`${id}`);
  
        if (user.getEmail() !== email) {
            const userExist = await this.userRepository.getOneByEmail(email)
            if (userExist) throw new UserAlreadyExistsError(email)
        }

        const userEdited = new User({
            id: user.getId(),
            name: name,
            email: email,
            createdAt: user.getCreatedAt(),
            password: user.getPassword(),
            photoFilename: user.getPhotoFilename(),
        })
        this.userRepository.edit(userEdited);

        return;
    }
}