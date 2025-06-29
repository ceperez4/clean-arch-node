import { IAuthToken } from "@/modules/shared/domain/services/iAuthToken";
import { IPasswordHasher } from "@/modules/shared/domain/services/iPasswordHasher";
import { UserRepository } from "@/modules/users/domain/userRepository";
import { InvalidCredentials } from "@modules/auth/application/errors/invalid-credentials.error";


export class SignInUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordHasher: IPasswordHasher,
        private readonly authToken: IAuthToken,
    ) { }

    async execute(email: string, password: string): Promise<string> {


        const user = await this.userRepository.getOneByEmail(email);
 
        if (!user) throw new InvalidCredentials();
        const passwordIsCorrect = await this.passwordHasher.compare(password, user.getPassword());

        if (!passwordIsCorrect) throw new InvalidCredentials();

        const token = await this.authToken.generateToken({
            name: user.getEmail(),
            email: user.getEmail()
        })
        return token;
    }
}