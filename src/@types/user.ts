/** Representação pública do usuário — nunca inclui a senha. */
export interface UserType {
    Id: number;
    Name: string;
    Birth: Date | null;
    Email: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateUserDTO {
    Name: string;
    Birth: Date | null;
    Email: string;
    Pass: string;
}

export interface UpdateUserDTO {
    Name?: string;
    Birth?: Date | null;
    Email?: string;
    Pass?: string;
}

/** Dados necessários para criar/atualizar um usuário via login Google. */
export interface GoogleUserDTO {
    Name: string;
    Email: string;
}
