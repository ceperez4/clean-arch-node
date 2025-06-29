import { SignInUseCase  } from "../../application/useCases";

export interface AuthControllerDependencies {
    signInUseCase: SignInUseCase
}