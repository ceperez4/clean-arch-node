import { FileSystemService } from "@/modules/shared/infrastructure/services/file-system";
import { UserCreateUseCase, UserDeleteUseCase, UserEditPhotoUseCase, UserEditUseCase, UserGetAllUseCase, UserGetByIdUseCase } from "../../application/useCases";

export interface UserControllerDependencies {
    fileSystemService: FileSystemService;
    userCreateUseCase: UserCreateUseCase;
    userGetAllUseCase: UserGetAllUseCase;
    userEditUseCase: UserEditUseCase;
    userGetByIdUseCase: UserGetByIdUseCase;
    userDeleteUseCase: UserDeleteUseCase;
    userEditPhotoUseCase: UserEditPhotoUseCase;

}