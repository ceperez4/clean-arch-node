import { FastifyReply, FastifyRequest } from "fastify";

import { AuthControllerDependencies } from "./auth-controller.dependencies";
import { SignInDto, SignInSchema } from "@modules/auth/application/dtos/signIn.dto";
import { ApiResponse } from "@/modules/shared/application/interfaces/api-response.interface";
import { fastifyErrorAuthHandler } from "./errorAuthHandler";

export class FastifyAuthController {
    constructor(
        private readonly dependencies: AuthControllerDependencies
    ) { }

    /*************************************************************** */
    /*************************************************************** */
    singIn = async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const validateData: SignInDto = SignInSchema.parse(req.body);
            const token = await this.dependencies.signInUseCase.execute(validateData.email, validateData.password);
            const response: ApiResponse<{ token: string }> = {
                status: 'ok',
                message: 'Login successfully',
                data: { token }
            }
            reply.send(response)

        } catch (error) {
            fastifyErrorAuthHandler(reply, error)
        }
    }
}