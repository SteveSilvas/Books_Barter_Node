export interface CategoryType {
    Id: number;
    Description: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateCategoryDTO {
    Description: string;
}

export interface UpdateCategoryDTO {
    Description?: string;
}
