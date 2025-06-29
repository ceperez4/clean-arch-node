import { BcryptPasswordHasher } from "@/modules/shared/infrastructure/services";
import { InMemoryUserRepository } from "./repositories/inMemoryUserRepository";
import { FileSystemService } from "@/modules/shared/infrastructure/services/file-system";
import {
    UserCreateUseCase,
    UserDeleteUseCase,
    UserEditPhotoUseCase,
    UserEditUseCase,
    UserGetAllUseCase,
    UserGetByIdUseCase
} from "@modules/users/application/useCases";


const userRepository = InMemoryUserRepository.getInstance();
const passwordHasher = new BcryptPasswordHasher();
const fileSystemService = new FileSystemService();

export const UserServiceContainer = {
    userCreateUseCase: new UserCreateUseCase(userRepository, passwordHasher),
    userGetAllUseCase: new UserGetAllUseCase(userRepository),
    userEditUseCase: new UserEditUseCase(userRepository),
    userGetByIdUseCase: new UserGetByIdUseCase(userRepository),
    userDeleteUseCase: new UserDeleteUseCase(userRepository),
    userEditPhotoUseCase: new UserEditPhotoUseCase(userRepository),
    fileSystemService: fileSystemService,
}
