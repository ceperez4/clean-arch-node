import { Request, Response } from "express";
import { ApiResponse } from "@/modules/shared/application/interfaces/api-response.interface";
import { expressErrorAuthHandler } from "./errorAuthHandler";
import { SignInDto,SignInSchema } from "../../application/dtos/signIn.dto";
import { AuthControllerDependencies } from "./auth-controller.dependencies";



export class ExpressAuthController {
    constructor(
        private readonly dependencies: AuthControllerDependencies
    ) { }

    /*************************************************************** */
    /*************************************************************** */
    signIn = (req: Request, res: Response) => {
        try {
            const validateData: SignInDto = SignInSchema.parse(req.body)
            this.dependencies.signInUseCase.execute(validateData.email, validateData.password)
                .then(token => {
                    const response: ApiResponse<{ token: string }> = {
                        status: 'ok',
                        message: 'Login successfully',
                        data: { token }
                    }
                    res.json(response)
                })
                .catch(err => expressErrorAuthHandler(res, err));

        } catch (error) {
            expressErrorAuthHandler(res, error)
        }
    }
}