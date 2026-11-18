export interface UserType {
    Id: number;
    Name: string;
    Birth: Date;
    Email: string;
    Pass: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateUserDTO {
    Name: string;
    Birth: Date;
    Email: string;
    Pass: string;
}

export interface UpdateUserDTO {
    Name?: string;
    Birth?: Date;
    Email?: string;
    Pass?: string;
}
