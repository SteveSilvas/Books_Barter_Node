import { StatusCodes } from 'http-status-codes';
import { LoginResponse, LoginType } from '../@types/auth';
import {
    CreateUserDTO,
    GoogleUserDTO,
    PublicUserType,
    UpdateUserDTO,
    UserType,
} from '../@types/user';
import { AppError } from '../errors/AppError';
import { User } from '../models';
import { followService } from './FollowService';
import { hashPassword, verifyPassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import {
    normalizeEmail,
    parseBirth,
    parseEmail,
    parseName,
    parsePassword,
} from '../utils/validation';

export interface IUserService {
    list(): Promise<PublicUserType[]>;
    getByUuid(uuid: string): Promise<PublicUserType>;
    getByEmail(email: string): Promise<PublicUserType>;
    getProfile(id: number): Promise<UserType>;
    create(data: CreateUserDTO): Promise<UserType>;
    login(data: LoginType): Promise<LoginResponse>;
    loginWithGoogle(data: GoogleUserDTO): Promise<LoginResponse>;
    update(id: number, data: UpdateUserDTO): Promise<UserType>;
    remove(id: number): Promise<void>;
}

/** Perfil do próprio usuário (dono da conta), sem a senha. */
function toSelf(user: User): UserType {
    const { Uuid, Name, Birth, Email, Provider, createdAt, updatedAt } =
        user.get({ plain: true });
    return { Uuid, Name, Birth, Email, Provider, createdAt, updatedAt };
}

/** Perfil público de terceiros: só dados não sensíveis. */
function toPublic(user: User): PublicUserType {
    const { Uuid, Name, Provider } = user.get({ plain: true });
    return { Uuid, Name, Provider };
}

function toLoginResponse(user: User): LoginResponse {
    const profile = toSelf(user);
    return {
        message: 'Usuário logado com sucesso.',
        token: signToken({
            sub: user.Id,
            uuid: profile.Uuid,
            email: profile.Email,
        }),
        data: {
            Uuid: profile.Uuid,
            Name: profile.Name,
            Email: profile.Email,
        },
    };
}

export class UserService implements IUserService {
    public async list(): Promise<PublicUserType[]> {
        const users = await User.findAll();
        return users.map(toPublic);
    }

    public async getByUuid(uuid: string): Promise<PublicUserType> {
        const user = await User.findOne({ where: { Uuid: uuid } });
        if (!user) {
            throw new AppError('Usuário não encontrado.', StatusCodes.NOT_FOUND);
        }
        const [followersCount, followingCount] = await Promise.all([
            followService.countFollowers(user.Id),
            followService.countFollowing(user.Id),
        ]);
        return { ...toPublic(user), followersCount, followingCount };
    }

    public async getByEmail(email: string): Promise<PublicUserType> {
        const user = await User.findOne({
            where: { Email: normalizeEmail(email) },
        });
        if (!user) {
            throw new AppError('Usuário não encontrado.', StatusCodes.NOT_FOUND);
        }
        return toPublic(user);
    }

    /** Perfil completo do próprio usuário (autenticado). */
    public async getProfile(id: number): Promise<UserType> {
        const user = await User.findByPk(id);
        if (!user) {
            throw new AppError('Usuário não encontrado.', StatusCodes.NOT_FOUND);
        }
        return toSelf(user);
    }

    public async create(data: CreateUserDTO): Promise<UserType> {
        const Email = parseEmail(data.Email);
        const existing = await User.findOne({ where: { Email } });
        if (existing) {
            throw new AppError(
                'Já existe usuário cadastrado com este email.',
                StatusCodes.CONFLICT,
            );
        }

        const user = await User.create({
            Name: parseName(data.Name),
            Birth: parseBirth(data.Birth),
            Email,
            Pass: await hashPassword(parsePassword(data.Pass)),
            Provider: 'local',
        });
        return toSelf(user);
    }

    public async login(data: LoginType): Promise<LoginResponse> {
        const user = await User.findOne({
            where: { Email: normalizeEmail(data.Email) },
        });
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
        const Email = normalizeEmail(data.Email);
        let user = await User.findOne({ where: { Email } });
        if (!user) {
            user = await User.create({
                Name: data.Name,
                Birth: null,
                Email,
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

        if (data.Name !== undefined) {
            user.Name = parseName(data.Name);
        }

        if (data.Birth !== undefined) {
            user.Birth = parseBirth(data.Birth);
        }

        if (data.Email !== undefined) {
            const Email = parseEmail(data.Email);
            if (Email !== user.Email) {
                const emailInUse = await User.findOne({ where: { Email } });
                if (emailInUse) {
                    throw new AppError(
                        'Já existe usuário cadastrado com este email.',
                        StatusCodes.CONFLICT,
                    );
                }
                user.Email = Email;
            }
        }

        if (data.Pass !== undefined) {
            await this.applyPasswordChange(user, data);
        }

        await user.save();
        return toSelf(user);
    }

    /**
     * Troca de senha: contas locais exigem a senha atual; contas Google não
     * possuem senha local e não podem defini-la por aqui.
     */
    private async applyPasswordChange(
        user: User,
        data: UpdateUserDTO,
    ): Promise<void> {
        if (user.Provider === 'google') {
            throw new AppError(
                'Contas Google não possuem senha local.',
                StatusCodes.FORBIDDEN,
            );
        }
        if (!user.Pass) {
            throw new AppError(
                'Usuário sem senha definida.',
                StatusCodes.CONFLICT,
            );
        }
        if (!data.CurrentPass) {
            throw new AppError(
                'Senha atual é obrigatória para trocar a senha.',
                StatusCodes.BAD_REQUEST,
            );
        }
        if (!(await verifyPassword(data.CurrentPass, user.Pass))) {
            throw new AppError('Senha atual incorreta.', StatusCodes.UNAUTHORIZED);
        }
        user.Pass = await hashPassword(parsePassword(data.Pass));
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
