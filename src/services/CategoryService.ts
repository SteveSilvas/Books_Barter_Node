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
    getById(id: number): Promise<CategoryType>;
    create(data: CreateCategoryDTO): Promise<CategoryType>;
    update(id: number, data: UpdateCategoryDTO): Promise<CategoryType>;
    remove(id: number): Promise<void>;
}

export class CategoryService implements ICategoryService {
    public async list(): Promise<CategoryType[]> {
        const categories = await Category.findAll();
        return categories.map((category) => category.get({ plain: true }) as CategoryType);
    }

    public async getById(id: number): Promise<CategoryType> {
        const category = await Category.findByPk(id);
        if (!category) {
            throw new AppError('Categoria não encontrada.', StatusCodes.NOT_FOUND);
        }
        return category.get({ plain: true }) as CategoryType;
    }

    public async create(data: CreateCategoryDTO): Promise<CategoryType> {
        const category = await Category.create(data);
        return category.get({ plain: true }) as CategoryType;
    }

    public async update(id: number, data: UpdateCategoryDTO): Promise<CategoryType> {
        const category = await Category.findByPk(id);
        if (!category) {
            throw new AppError('Categoria não encontrada.', StatusCodes.NOT_FOUND);
        }

        if (data.Description !== undefined) category.Description = data.Description;

        await category.save();
        return category.get({ plain: true }) as CategoryType;
    }

    public async remove(id: number): Promise<void> {
        const category = await Category.findByPk(id);
        if (!category) {
            throw new AppError('Categoria não encontrada.', StatusCodes.NOT_FOUND);
        }
        await category.destroy();
    }
}

export const categoryService = new CategoryService();
