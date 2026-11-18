import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { LoginType } from '../@types/auth';
import { CreateUserDTO, UpdateUserDTO } from '../@types/user';
import { userService } from '../services/UserService';
import { parseId } from '../utils/parseId';

export class UserController {
    public async list(req: Request, res: Response): Promise<Response> {
        const users = await userService.list();
        return res.status(StatusCodes.OK).json(users);
    }

    public async getById(req: Request, res: Response): Promise<Response> {
        const id = parseId(req.params.id);
        const user = await userService.getById(id);
        return res.status(StatusCodes.OK).json(user);
    }

    public async getByEmail(req: Request, res: Response): Promise<Response> {
        const user = await userService.getByEmail(req.params.email);
        return res.status(StatusCodes.OK).json(user);
    }

    public async create(req: Request, res: Response): Promise<Response> {
        const data: CreateUserDTO = {
            Name: req.body.Name,
            Birth: req.body.Birth,
            Email: req.body.Email,
            Pass: req.body.Pass,
        };
        const user = await userService.create(data);
        return res.status(StatusCodes.CREATED).json(user);
    }

    public async login(req: Request, res: Response): Promise<Response> {
        const data: LoginType = {
            Email: req.body.Email,
            Pass: req.body.Pass,
        };
        const result = await userService.login(data);
        return res.status(StatusCodes.OK).json(result);
    }

    public async update(req: Request, res: Response): Promise<Response> {
        const id = parseId(req.params.id);
        const data: UpdateUserDTO = {
            Name: req.body.Name,
            Birth: req.body.Birth,
            Email: req.body.Email,
            Pass: req.body.Pass,
        };
        const user = await userService.update(id, data);
        return res.status(StatusCodes.OK).json(user);
    }

    public async remove(req: Request, res: Response): Promise<Response> {
        const id = parseId(req.params.id);
        await userService.remove(id);
        return res.status(StatusCodes.NO_CONTENT).send();
    }
}

export const userController = new UserController();
