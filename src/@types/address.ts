export interface AddressType {
    Uuid: string;
    Rua: string;
    Numero: string;
    Complemento: string;
    Bairro: string;
    Cep: number;
    Cidade: string;
    Estado: string;
    Pais: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateAddressDTO {
    Rua: string;
    Numero: string;
    Complemento: string;
    Bairro: string;
    Cep: number;
    Cidade: string;
    Estado: string;
    Pais: string;
}

export interface UpdateAddressDTO {
    Rua?: string;
    Numero?: string;
    Complemento?: string;
    Bairro?: string;
    Cep?: number;
    Cidade?: string;
    Estado?: string;
    Pais?: string;
}
