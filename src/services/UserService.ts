import { StatusCodes } from 'http-status-codes';
import { LoginResponse, LoginType } from '../@types/auth';
import {
    CreateUserDTO,
    GoogleUserDTO,
    UpdateUserDTO,
    UserType,
} from '../@types/user';
import { AppError } from '../errors/AppError';
import { User } from '../models';
import { hashPassword, verifyPassword } from '../utils/password';
import { signToken } from '../utils/jwt';

export interface IUserService {
    list(): Promise<UserType[]>;
    getById(id: number): Promise<UserType>;
    getByEmail(email: string): Promise<UserType>;
    create(data: CreateUserDTO): Promise<UserType>;
    login(data: LoginType): Promise<LoginResponse>;
    loginWithGoogle(data: GoogleUserDTO): Promise<LoginResponse>;
    update(id: number, data: UpdateUserDTO): Promise<UserType>;
    remove(id: number): Promise<void>;
}

/** Remove a senha antes de expor o usuário para fora do domínio. */
function toPublic(user: User): UserType {
    const { Id, Name, Birth, Email, createdAt, updatedAt } = user.get({
        plain: true,
    });
    return { Id, Name, Birth, Email, createdAt, updatedAt };
}

function toLoginResponse(user: User): LoginResponse {
    const publicUser = toPublic(user);
    return {
        message: 'Usuário logado com sucesso.',
        token: signToken({ sub: publicUser.Id, email: publicUser.Email }),
        data: {
            Id: publicUser.Id,
            Name: publicUser.Name,
            Email: publicUser.Email,
        },
    };
}

export class UserService implements IUserService {
    public async list(): Promise<UserType[]> {
        const users = await User.findAll();
        return users.map(toPublic);
    }

    public async getById(id: number): Promise<UserType> {
        const user = await User.findByPk(id);
        if (!user) {
            throw new AppError('Usuário não encontrado.', StatusCodes.NOT_FOUND);
        }
        return toPublic(user);
    }

    public async getByEmail(email: string): Promise<UserType> {
        const user = await User.findOne({ where: { Email: email } });
        if (!user) {
            throw new AppError('Usuário não encontrado.', StatusCodes.NOT_FOUND);
        }
        return toPublic(user);
    }

    public async create(data: CreateUserDTO): Promise<UserType> {
        const existing = await User.findOne({ where: { Email: data.Email } });
        if (existing) {
            throw new AppError(
                'Já existe usuário cadastrado com este email.',
                StatusCodes.CONFLICT,
            );
        }

        const user = await User.create({
            Name: data.Name,
            Birth: data.Birth,
            Email: data.Email,
            Pass: await hashPassword(data.Pass),
            Provider: 'local',
        });
        return toPublic(user);
    }

    public async login(data: LoginType): Promise<LoginResponse> {
        const user = await User.findOne({ where: { Email: data.Email } });
        if (!user || !user.Pass) {
            throw new AppError('Email inválido.', StatusCodes.UNAUTHORIZED);
        }
        if (!(await verifyPassword(data.Pass, user.Pass))) {
            throw new AppError('Senha incorreta.', StatusCodes.UNAUTHORIZED);
        }

        return toLoginResponse(user);
    }

    /**
     * Autentica (ou cadastra) um usuário a partir dos dados verificados de um
     * login Google. Usuários novos entram sem senha local (`Pass` nulo).
     */
    public async loginWithGoogle(data: GoogleUserDTO): Promise<LoginResponse> {
        let user = await User.findOne({ where: { Email: data.Email } });
        if (!user) {
            user = await User.create({
                Name: data.Name,
                Birth: null,
                Email: data.Email,
                Pass: null,
                Provider: 'google',
            });
        }
        return toLoginResponse(user);
    }

    public async update(id: number, data: UpdateUserDTO): Promise<UserType> {
        const user = await User.findByPk(id);
        if (!user) {
            throw new AppError('Usuário não encontrado.', StatusCodes.NOT_FOUND);
        }

        if (data.Email && data.Email !== user.Email) {
            const emailInUse = await User.findOne({ where: { Email: data.Email } });
            if (emailInUse) {
                throw new AppError(
                    'Já existe usuário cadastrado com este email.',
                    StatusCodes.CONFLICT,
                );
            }
        }

        if (data.Name !== undefined) user.Name = data.Name;
        if (data.Birth !== undefined) user.Birth = data.Birth;
        if (data.Email !== undefined) user.Email = data.Email;
        if (data.Pass !== undefined) user.Pass = await hashPassword(data.Pass);

        await user.save();
        return toPublic(user);
    }

    public async remove(id: number): Promise<void> {
        const user = await User.findByPk(id);
        if (!user) {
            throw new AppError('Usuário não encontrado.', StatusCodes.NOT_FOUND);
        }
        await user.destroy();
    }
}

export const userService = new UserService();
