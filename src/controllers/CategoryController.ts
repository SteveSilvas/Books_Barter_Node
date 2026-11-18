import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CreateCategoryDTO, UpdateCategoryDTO } from '../@types/category';
import { categoryService } from '../services/CategoryService';
import { parseUuid } from '../utils/parseId';

export class CategoryController {
    public async list(req: Request, res: Response): Promise<Response> {
        const categories = await categoryService.list();
        return res.status(StatusCodes.OK).json(categories);
    }

    public async getByUuid(req: Request, res: Response): Promise<Response> {
        const uuid = parseUuid(req.params.uuid);
        const category = await categoryService.getByUuid(uuid);
        return res.status(StatusCodes.OK).json(category);
    }

    public async create(req: Request, res: Response): Promise<Response> {
        const data: CreateCategoryDTO = { Description: req.body.Description };
        const category = await categoryService.create(data);
        return res.status(StatusCodes.CREATED).json(category);
    }

    public async update(req: Request, res: Response): Promise<Response> {
        const uuid = parseUuid(req.params.uuid);
        const data: UpdateCategoryDTO = { Description: req.body.Description };
        const category = await categoryService.update(uuid, data);
        return res.status(StatusCodes.OK).json(category);
    }

    public async remove(req: Request, res: Response): Promise<Response> {
        const uuid = parseUuid(req.params.uuid);
        await categoryService.remove(uuid);
        return res.status(StatusCodes.NO_CONTENT).send();
    }
}

export const categoryController = new CategoryController();
