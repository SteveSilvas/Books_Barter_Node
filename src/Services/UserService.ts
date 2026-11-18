import { LoginType } from "../@types/LoginType";
import { UserType } from "../@types/UserType";
const UserEntity = require("../entity/UserEntity");

export interface UserService {
    GetUsers(): Promise<UserType[]>;
    GetById(id: number): Promise<UserType>;
    GetByEmail(email: string): Promise<UserType>;
    Create(user: UserType): Promise<UserType>;
    Login(data: LoginType): Promise<LoginResponse | undefined>;
    Update(data: UserType): Promise<UserType | undefined>;
}

type LoginResponse = {
    message: string;
    data: UserType;
};
export const userService: UserService = {
    async GetUsers() {
        try {
            const usersList: UserType[] = await UserEntity.findAll();
            return usersList;
        } catch (error) {
            throw error;
        }
    },

    async GetById(id: number) {
        try {
            const user: UserType = await UserEntity.findByPk(id);
            return user;
        } catch (error) {
            throw error;
        }
    },

    async GetByEmail(email: string) {
        try {
            const user: UserType = await UserEntity.findOne({
                where: { email },
            });
            return user;
        } catch (error) {
            throw error;
        }
    },

    async Create(data: UserType) {
        try {
            const user: UserType = await UserEntity.create(data);
            return user;
        } catch (error) {
            throw error;
        }
    },

    async Login(data: LoginType) {
        try {
            const Email = data.Email;
            const Pass = data.Pass;
            const user: UserType = await UserEntity.findOne({
                where: { Email },
            });

            if (!user) throw "Email inválido.";

            if (user.Pass != Pass) throw "Senha incorreta.";

            if (user && user.Pass == Pass) {
                const response: LoginResponse = {
                    message: "Usuário logado com sucesso.",
                    data: user,
                };

                return response;
            }
        } catch (error) {
            throw error;
        }
    },

    async Update(data: UserType) {
        try {
            const user: any = await UserEntity.findByPk(data.Id);
            if (!user) throw "Usuário não encontrado";

            if (data.Email && data.Email !== user.Email) {
                const emailInUse: UserType = await UserEntity.findOne({
                    where: { Email: data.Email },
                });
                if (emailInUse) throw "Já existe usuário cadastrado com este email.";
            }

            if (data.Name !== undefined) user.Name = data.Name;
            if (data.Birth !== undefined) user.Birth = data.Birth;
            if (data.Email !== undefined) user.Email = data.Email;
            if (data.Pass !== undefined) user.Pass = data.Pass;

            await user.save();

            return user;
        } catch (error) {
            throw error;
        }
    },
};
