import { FastifyReply, FastifyRequest } from "fastify";
import { UserControllerDependencies } from "./user-controller.dependencies";
import { CreateUserDto, CreateUserSchema } from "../../application/dtos/user-create.dto";
import { ApiResponse } from "@/modules/shared/application/interfaces/api-response.interface";
import { UserResponseDto } from "../../application/dtos/user-response.dto";
import { fastifyErrorUserHandler } from "./errorUsersHandler";
import { EditUserDto, EditUserSchema } from "../../application/dtos/user-edit.dto";
import { IdUserDto, IdUserSchema } from "../../application/dtos/user-id.dto";
import path from "node:path";
import { envs } from "@/config/envs";

export class FastifyUserController {
    constructor(
        private readonly dependencies: UserControllerDependencies
    ) { }

    /*************************************************************** */
    /*************************************************************** */
    createUser = async (req: FastifyRequest, reply: FastifyReply) => {
        try {

            const validateData: CreateUserDto
                = CreateUserSchema.parse(req.body);

            const file = req.file as any;

            const photoFilename = file ? file.filename : null;
            console.log(photoFilename)
            const user = await this.dependencies.userCreateUseCase.execute({ ...validateData, photoFilename });

            const response: ApiResponse<UserResponseDto> = {
                status: 'ok',
                message: 'User created successfully',
                data: user
            }

            reply.send(response)

        } catch (error) {
            this.dependencies.fileSystemService.deleteFile((req.file as any).path)
            fastifyErrorUserHandler(reply, error)
        }
    }

    /*************************************************************** */
    /*************************************************************** */
    getAllUsers = async (_req: FastifyRequest, reply: FastifyReply) => {
        try {
            const users = await this.dependencies.userGetAllUseCase.execute();
            const response: ApiResponse<UserResponseDto[]> = {
                status: 'ok',
                message: 'Users retrieved successfully',
                data: users
            }
            reply.status(200).send(response)

        } catch (error) {
            fastifyErrorUserHandler(reply, error)
        }
    }

    /*************************************************************** */
    /*************************************************************** */
    editUser = async (
        req: FastifyRequest,
        reply: FastifyReply
    ) => {
        try {
            const { id } = req.params as any
            const { email, name } = req.body as any;

            const validateData: EditUserDto = EditUserSchema.parse({ id, email, name });

            await this.dependencies.userEditUseCase.execute(validateData);

            const response: ApiResponse<null> = {
                status: 'ok',
                message: 'User edited successfully'
            }

            reply.status(200).send(response);

        } catch (error) {
            fastifyErrorUserHandler(reply, error)
        }
    }

    /*************************************************************** */
    /*************************************************************** */
    getUserById = async (
        req: FastifyRequest,
        reply: FastifyReply
    ) => {
        try {
            const { id } = req.params as any
            const validateData: IdUserDto = IdUserSchema.parse(Number(id));

            const user = await this.dependencies.userGetByIdUseCase.execute(validateData);

            const response: ApiResponse<UserResponseDto> = {
                status: 'ok',
                message: 'User retrieved successfully',
                data: user
            };

            reply.status(200).send(response);

        } catch (error) {
            fastifyErrorUserHandler(reply, error);
        }
    }

    /*************************************************************** */
    /*************************************************************** */
    deleteUser = async (
        req: FastifyRequest,
        reply: FastifyReply
    ) => {
        try {
            const { id } = req.params as any;
            const validateData: IdUserDto = IdUserSchema.parse(Number(id));

            await this.dependencies.userDeleteUseCase.execute(validateData);

            const response: ApiResponse<null> = {
                status: 'ok',
                message: 'User deleted successfully'
            };

            reply.status(200).send(response);

        } catch (error) {
            fastifyErrorUserHandler(reply, error)
        }
    }

    /*************************************************************** */
    /*************************************************************** */
    editUserPhoto = async (
        req: FastifyRequest,
        reply: FastifyReply
    ) => {
        try {
            const { id } = req.params as any;
            const file = req.file as any;
            const photoFilename = file?.filename

            const validateData: IdUserDto = IdUserSchema.parse(Number(id));
            const photo = await this.dependencies.userEditPhotoUseCase.execute({ id: validateData, photoFilename: photoFilename! });
            if (photo) {
                this.dependencies.fileSystemService.deleteFile(path.join(envs.pathUserFiles, photo))
            }

            const response: ApiResponse<null> = {
                status: 'ok',
                message: 'User photo edited successfully'
            }

            reply.status(200).send(response)

        } catch (error) {
            this.dependencies.fileSystemService.deleteFile((req.file as any).path)
            fastifyErrorUserHandler(reply, error)
        }

    }

}