export interface UserResponseDto {
    id?: number;
    name: string;
    email: string;
    photoFilename: string | null;
    createdAt: Date;
}
