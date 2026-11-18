import { StatusCodes } from 'http-status-codes';
import {
    AddressType,
    CreateAddressDTO,
    UpdateAddressDTO,
} from '../@types/address';
import { AppError } from '../errors/AppError';
import { Address } from '../models';

export interface IAddressService {
    list(): Promise<AddressType[]>;
    getByUuid(uuid: string): Promise<AddressType>;
    create(data: CreateAddressDTO): Promise<AddressType>;
    update(uuid: string, data: UpdateAddressDTO): Promise<AddressType>;
    remove(uuid: string): Promise<void>;
}

export class AddressService implements IAddressService {
    public async list(): Promise<AddressType[]> {
        const addresses = await Address.findAll();
        return addresses.map((address) => address.get({ plain: true }) as AddressType);
    }

    public async getByUuid(uuid: string): Promise<AddressType> {
        const address = await Address.findOne({ where: { Uuid: uuid } });
        if (!address) {
            throw new AppError('Endereço não encontrado.', StatusCodes.NOT_FOUND);
        }
        return address.get({ plain: true }) as AddressType;
    }

    public async create(data: CreateAddressDTO): Promise<AddressType> {
        const address = await Address.create(data);
        return address.get({ plain: true }) as AddressType;
    }

    public async update(uuid: string, data: UpdateAddressDTO): Promise<AddressType> {
        const address = await Address.findOne({ where: { Uuid: uuid } });
        if (!address) {
            throw new AppError('Endereço não encontrado.', StatusCodes.NOT_FOUND);
        }

        if (data.Rua !== undefined) address.Rua = data.Rua;
        if (data.Numero !== undefined) address.Numero = data.Numero;
        if (data.Complemento !== undefined) address.Complemento = data.Complemento;
        if (data.Bairro !== undefined) address.Bairro = data.Bairro;
        if (data.Cep !== undefined) address.Cep = data.Cep;
        if (data.Cidade !== undefined) address.Cidade = data.Cidade;
        if (data.Estado !== undefined) address.Estado = data.Estado;
        if (data.Pais !== undefined) address.Pais = data.Pais;

        await address.save();
        return address.get({ plain: true }) as AddressType;
    }

    public async remove(uuid: string): Promise<void> {
        const address = await Address.findOne({ where: { Uuid: uuid } });
        if (!address) {
            throw new AppError('Endereço não encontrado.', StatusCodes.NOT_FOUND);
        }
        await address.destroy();
    }
}

export const addressService = new AddressService();
