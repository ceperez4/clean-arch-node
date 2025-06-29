import { Router } from 'express'
import { ExpressUserController } from '@modules/users/infrastructure/controllers/expressUserController';
import { expressAuthMiddleware } from '@/modules/shared/infrastructure/middlewares/expressAuth.middleware';
import {
    fileSizes,
    imageFilter,
    singleUpload,
    usersStorage
} from '@/modules/shared/infrastructure/middlewares/files';
import { UserServiceContainer } from '../user.container';

export class ExpressUserRoutes {

    static get routes(): Router {

        const router = Router()

        const expressUserController = new ExpressUserController(
            UserServiceContainer
        );

        router.post('/', singleUpload({
            field: 'photo',
            fileSize: fileSizes['3MB'],
            fileStorage: usersStorage,
            filter: imageFilter,
            isRequired: false
        }), expressUserController.createUser);

        router.get('/', expressAuthMiddleware, expressUserController.getAllUsers);

        router.put('/photo/:id', singleUpload({
            field: 'photo',
            fileSize: fileSizes['3MB'],
            fileStorage: usersStorage,
            filter: imageFilter,
            isRequired: true
        }), expressAuthMiddleware, expressUserController.editUserPhoto);

        router.put('/:id', expressAuthMiddleware, expressUserController.editUser);

        router.get('/:id', expressAuthMiddleware, expressUserController.getUserById);

        router.delete('/:id', expressAuthMiddleware, expressUserController.deleteUser);


        return router;
    }

}