export type AuthProvider = 'local' | 'google';

/** Perfil do próprio usuário (dono da conta) — nunca inclui a senha. */
export interface UserType {
    Uuid: string;
    Name: string;
    Birth: Date | null;
    Email: string;
    Provider: AuthProvider;
    createdAt?: Date;
    updatedAt?: Date;
}

/** Perfil público de terceiros — expõe apenas dados não sensíveis. */
export interface PublicUserType {
    Uuid: string;
    Name: string;
    Provider: AuthProvider;
}

export interface CreateUserDTO {
    Name: string;
    Birth: string | Date | null;
    Email: string;
    Pass: string;
}

export interface UpdateUserDTO {
    Name?: string;
    Birth?: string | Date | null;
    Email?: string;
    /** Nova senha; exige `CurrentPass` válido. */
    Pass?: string;
    /** Senha atual, obrigatória ao trocar a senha de uma conta local. */
    CurrentPass?: string;
}

/** Dados necessários para criar/atualizar um usuário via login Google. */
export interface GoogleUserDTO {
    Name: string;
    Email: string;
}
