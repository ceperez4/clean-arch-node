import { User } from "./user";

export interface UserRepository {

    create(user: User): Promise<User>;
    getAll(): Promise<User[]>;
    getOneById(id: number): Promise<User | null>;
    getOneByEmail(email: string): Promise<User | null>;
    edit(user: User): Promise<void>;
    delete(id: number): Promise<void>;
}