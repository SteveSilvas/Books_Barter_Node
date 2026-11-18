import { StatusCodes } from 'http-status-codes';
import {
    CategoryType,
    CreateCategoryDTO,
    UpdateCategoryDTO,
} from '../@types/category';
import { AppError } from '../errors/AppError';
import { Category } from '../models';

export interface ICategoryService {
    list(): Promise<CategoryType[]>;
    getByUuid(uuid: string): Promise<CategoryType>;
    create(data: CreateCategoryDTO): Promise<CategoryType>;
    update(uuid: string, data: UpdateCategoryDTO): Promise<CategoryType>;
    remove(uuid: string): Promise<void>;
}

export class CategoryService implements ICategoryService {
    public async list(): Promise<CategoryType[]> {
        const categories = await Category.findAll();
        return categories.map((category) => category.get({ plain: true }) as CategoryType);
    }

    public async getByUuid(uuid: string): Promise<CategoryType> {
        const category = await Category.findOne({ where: { Uuid: uuid } });
        if (!category) {
            throw new AppError('Categoria não encontrada.', StatusCodes.NOT_FOUND);
        }
        return category.get({ plain: true }) as CategoryType;
    }

    public async create(data: CreateCategoryDTO): Promise<CategoryType> {
        const category = await Category.create(data);
        return category.get({ plain: true }) as CategoryType;
    }

    public async update(uuid: string, data: UpdateCategoryDTO): Promise<CategoryType> {
        const category = await Category.findOne({ where: { Uuid: uuid } });
        if (!category) {
            throw new AppError('Categoria não encontrada.', StatusCodes.NOT_FOUND);
        }

        if (data.Description !== undefined) category.Description = data.Description;

        await category.save();
        return category.get({ plain: true }) as CategoryType;
    }

    public async remove(uuid: string): Promise<void> {
        const category = await Category.findOne({ where: { Uuid: uuid } });
        if (!category) {
            throw new AppError('Categoria não encontrada.', StatusCodes.NOT_FOUND);
        }
        await category.destroy();
    }
}

export const categoryService = new CategoryService();
