import { Router } from "express";
import { ExpressAuthController } from "@modules/auth/infrastructure/controllers/expressAuthController";
import { AuthServiceContainer } from "../auth.container";

export class ExpressAuthRoutes {
    public static get routes() {
        const router = Router();

        const expressAuthController = new ExpressAuthController(AuthServiceContainer);
        router.post('/sign-in', expressAuthController.signIn);

        return router;
    }
}