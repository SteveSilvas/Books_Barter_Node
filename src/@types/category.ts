export interface CategoryType {
    Uuid: string;
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
