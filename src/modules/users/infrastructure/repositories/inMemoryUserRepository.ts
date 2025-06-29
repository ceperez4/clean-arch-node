import { User } from "@modules/users/domain/user";
import { UserRepository } from "@modules/users/domain/userRepository";


export class InMemoryUserRepository implements UserRepository {

    private static instance: InMemoryUserRepository;
    private users: User[] = [];

    private constructor() { }

    public static getInstance(): InMemoryUserRepository {
        if (!InMemoryUserRepository.instance) {
            InMemoryUserRepository.instance = new InMemoryUserRepository();
        }
        return InMemoryUserRepository.instance;
    }

    private generateId(): number {
        return this.users.length === 0
            ? 1
            : Number(this.users.at(-1)?.getId()) + 1;
    }

    async create(user: User): Promise<User> {
        const newUser = new User({
            id: this.generateId(),
            name: user.getName(),
            email: user.getEmail(),
            password: user.getPassword(),
            photoFilename: user.getPhotoFilename(),
            createdAt: user.getCreatedAt(),
        })
        this.users.push(newUser);
        return newUser;
    }

    async getAll(): Promise<User[]> {
        return this.users;
    }

    async getOneById(id: number): Promise<User | null> {
        return this.users.find((user) => user.getId() === id) || null;
    }

    async getOneByEmail(email: string): Promise<User | null> {
        const user = this.users.find((user) => user.getEmail() === email) || null
        return user;
    }

    async edit(user: User): Promise<void> {
        const index = this.users.findIndex((u) => u.getId() == user.getId());
        this.users[index] = user;
    }

    async delete(id: number): Promise<void> {
        this.users = this.users.filter((user) => user.getId() !== id);
    }
}