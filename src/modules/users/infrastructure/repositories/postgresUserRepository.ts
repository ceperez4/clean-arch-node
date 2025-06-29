import { User } from "../../domain/user";
import { UserRepository } from "../../domain/userRepository";

export class PostgresUserRepository implements UserRepository{
    constructor(){}
    create(user: User): Promise<User> {
        throw new Error("Method not implemented.");
    }
    getAll(): Promise<User[]> {
        throw new Error("Method not implemented.");
    }
    getOneById(id: number): Promise<User | null> {
        throw new Error("Method not implemented.");
    }
    getOneByEmail(email: string): Promise<User | null> {
        throw new Error("Method not implemented.");
    }
    edit(user: User): Promise<void> {
        throw new Error("Method not implemented.");
    }
    delete(id: number): Promise<void> {
        throw new Error("Method not implemented.");
    }

}