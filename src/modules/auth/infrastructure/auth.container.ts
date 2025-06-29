import { envs } from "@/config/envs";
import { BcryptPasswordHasher, JwtAuthToken } from "@/modules/shared/infrastructure/services";
import { InMemoryUserRepository } from "@/modules/users/infrastructure/repositories/inMemoryUserRepository";
import { SignInUseCase } from "../application/useCases";

const userRepository = InMemoryUserRepository.getInstance();
const passwordHasher = new BcryptPasswordHasher();
const authToken = new JwtAuthToken(envs.authTokenSecretKey, '1d');


export const AuthServiceContainer = {
    signInUseCase: new SignInUseCase(
        userRepository,
        passwordHasher,
        authToken
    )
}