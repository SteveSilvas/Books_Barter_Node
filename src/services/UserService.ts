import { StatusCodes } from 'http-status-codes';
import { CreateUserDTO, UpdateUserDTO, UserType } from '../@types/user';
import { LoginResponse, LoginType } from '../@types/auth';
import { AppError } from '../errors/AppError';
import { User } from '../models';

export interface IUserService {
    list(): Promise<UserType[]>;
    getById(id: number): Promise<UserType>;
    getByEmail(email: string): Promise<UserType>;
    create(data: CreateUserDTO): Promise<UserType>;
    login(data: LoginType): Promise<LoginResponse>;
    update(id: number, data: UpdateUserDTO): Promise<UserType>;
    remove(id: number): Promise<void>;
}

export class UserService implements IUserService {
    public async list(): Promise<UserType[]> {
        const users = await User.findAll();
        return users.map((user) => user.get({ plain: true }) as UserType);
    }

    public async getById(id: number): Promise<UserType> {
        const user = await User.findByPk(id);
        if (!user) {
            throw new AppError('Usuário não encontrado.', StatusCodes.NOT_FOUND);
        }
        return user.get({ plain: true }) as UserType;
    }

    public async getByEmail(email: string): Promise<UserType> {
        const user = await User.findOne({ where: { Email: email } });
        if (!user) {
            throw new AppError('Usuário não encontrado.', StatusCodes.NOT_FOUND);
        }
        return user.get({ plain: true }) as UserType;
    }

    public async create(data: CreateUserDTO): Promise<UserType> {
        const existing = await User.findOne({ where: { Email: data.Email } });
        if (existing) {
            throw new AppError(
                'Já existe usuário cadastrado com este email.',
                StatusCodes.CONFLICT,
            );
        }

        const user = await User.create(data);
        return user.get({ plain: true }) as UserType;
    }

    public async login(data: LoginType): Promise<LoginResponse> {
        const user = await User.findOne({ where: { Email: data.Email } });
        if (!user) {
            throw new AppError('Email inválido.', StatusCodes.UNAUTHORIZED);
        }
        if (user.Pass !== data.Pass) {
            throw new AppError('Senha incorreta.', StatusCodes.UNAUTHORIZED);
        }

        return {
            message: 'Usuário logado com sucesso.',
            data: { Id: user.Id, Name: user.Name, Email: user.Email },
        };
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
        if (data.Pass !== undefined) user.Pass = data.Pass;

        await user.save();
        return user.get({ plain: true }) as UserType;
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
