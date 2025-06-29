import { Request, Response } from "express";
import path from 'node:path';
import { CreateUserDto, CreateUserSchema } from "@modules/users/application/dtos/user-create.dto";
import { ApiResponse } from "@/modules/shared/application/interfaces/api-response.interface";
import { UserResponseDto } from "@modules/users/application/dtos/user-response.dto";
import { expressErrorUserHandler } from "./errorUsersHandler";
import { EditUserDto, EditUserSchema } from "@modules/users/application/dtos/user-edit.dto";
import { IdUserDto, IdUserSchema } from "../../application/dtos/user-id.dto";
import { UserControllerDependencies } from "./user-controller.dependencies";

export class ExpressUserController {
    constructor(
        private readonly dependencies: UserControllerDependencies,
    ) { }


    /*************************************************************** */
    /*************************************************************** */
    createUser = (req: Request, res: Response) => {
        try {
            const validatedData: CreateUserDto = CreateUserSchema.parse(req.body);
            const file = req.file;
            const photoFilename = file ? file.filename : null;
            this.dependencies.userCreateUseCase
                .execute({ ...validatedData, photoFilename: photoFilename })
                .then(user => {
                    const response: ApiResponse<UserResponseDto> = {
                        status: 'ok',
                        message: 'User created successfully',
                        data: user
                    };
                    return res.status(201).json(response);
                })
                .catch(error => {
                    if (file) this.dependencies.fileSystemService.deleteFile(file.path);
                    expressErrorUserHandler(res, error)
                });
        } catch (error) {
            if (req.file) this.dependencies.fileSystemService.deleteFile(req.file.path);
            expressErrorUserHandler(res, error);
        }

    }

    /*************************************************************** */
    /*************************************************************** */
    getAllUsers = (_req: Request, res: Response) => {
        this.dependencies.userGetAllUseCase
            .execute()
            .then(users => {
                const response: ApiResponse<UserResponseDto[]> = {
                    status: 'ok',
                    message: 'Users retrieved successfully',
                    data: users
                }
                res.status(200).json(response)
            })
            .catch(error => expressErrorUserHandler(res, error));
    }

    /*************************************************************** */
    /*************************************************************** */
    editUser = (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const { email, name } = req.body;
            const validateData: EditUserDto = EditUserSchema.parse({ id, email, name });
            this.dependencies.userEditUseCase
                .execute(validateData)
                .then(() => {
                    const response: ApiResponse<null> = {
                        status: 'ok',
                        message: 'User edited successfully'
                    }
                    res.status(200).json(response)
                })
                .catch(error => expressErrorUserHandler(res, error));
        } catch (error) {
            expressErrorUserHandler(res, error);
        }

    }

    /*************************************************************** */
    /*************************************************************** */
    getUserById = (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const validateData: IdUserDto = IdUserSchema.parse(Number(id));
            this.dependencies.userGetByIdUseCase
                .execute(validateData)
                .then(user => {
                    const response: ApiResponse<UserResponseDto> = {
                        status: 'ok',
                        message: 'User retrieved successfully',
                        data: user
                    }
                    res.status(200).json(response)
                })
                .catch(error => expressErrorUserHandler(res, error));

        } catch (error) {
            expressErrorUserHandler(res, error);
        }
    }

    /*************************************************************** */
    /*************************************************************** */
    deleteUser = (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const validateData: IdUserDto = IdUserSchema.parse(Number(id));
            this.dependencies.userDeleteUseCase
                .execute(validateData)
                .then(() => {
                    const response: ApiResponse<null> = {
                        status: 'ok',
                        message: 'User deleted successfully'
                    }
                    res.status(200).json(response)
                })
                .catch(error => expressErrorUserHandler(res, error));

        } catch (error) {
            expressErrorUserHandler(res, error);
        }
    }

    /*************************************************************** */
    /*************************************************************** */
    editUserPhoto = (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const file = req.file;
            const photoFilename = file?.filename
            const validateData: IdUserDto = IdUserSchema.parse(Number(id));
            this.dependencies.userEditPhotoUseCase
                .execute({ id: validateData, photoFilename: photoFilename! })
                .then(photo => {

                    if (photo) {
                        this.dependencies.fileSystemService.deleteFile(path.join(file?.destination!, photo))
                    }

                    const response: ApiResponse<null> = {
                        status: 'ok',
                        message: 'User photo edited successfully'
                    }

                    res.status(200).json(response)
                })
                .catch(error => {
                    if (file) this.dependencies.fileSystemService.deleteFile(file.path)
                    expressErrorUserHandler(res, error)
                });
        } catch (error) {
            expressErrorUserHandler(res, error);
        }

    }
}