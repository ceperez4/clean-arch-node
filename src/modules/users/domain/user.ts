import { UserInvalidArgumentError } from "./errors/user-invalid-argument.error";

export class User {

    private readonly id?: number;
    private name: string;
    private email: string;
    private password: string;
    private readonly createdAt: Date;
    private photoFilename: string | null;

    /******************************************* */
    /******************************************* */
    constructor(
        props: {
            id?: number,
            name: string,
            email: string,
            password: string,
            createdAt: Date,
            photoFilename: string | null
        }
    ) {

        this.id = props.id;
        this.name = props.name;
        this.email = props.email;
        this.password = props.password;
        this.createdAt = props.createdAt ?? new Date();
        this.photoFilename = props.photoFilename ?? null;
    }

    /******************************************* */
    /******************************************* */
    public static create(props: {
        name: string,
        email: string,
        password: string,
        photoFilename: string | null
    }): User {

        this.validateName(props.name);
        this.validateEmail(props.email);

        return new User({
            ...props,
            createdAt: new Date(),
        });
    }

    /******************************************* */
    /******************************************* */
    private static validateName(name: string) {
        if (!name.trim()) throw new UserInvalidArgumentError('UserName is required');
    }
    private static validateEmail(email: string) {
        if (!email.trim()) throw new UserInvalidArgumentError('Email is required');
    }

    /******************************************* */
    /******************************************* */
    public getId(): number | undefined {
        return this.id;
    }
    public getName(): string {
        return this.name;
    }
    public getEmail(): string {
        return this.email;
    }
    public getPassword(): string {
        return this.password;
    }
    public getPhotoFilename(): string | null {
        return this.photoFilename;
    }
    public getCreatedAt(): Date {
        return this.createdAt;
    }


}