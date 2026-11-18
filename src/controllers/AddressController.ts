import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CreateAddressDTO, UpdateAddressDTO } from '../@types/address';
import { addressService } from '../services/AddressService';
import { parseUuid } from '../utils/parseId';

export class AddressController {
    public async list(req: Request, res: Response): Promise<Response> {
        const addresses = await addressService.list();
        return res.status(StatusCodes.OK).json(addresses);
    }

    public async getByUuid(req: Request, res: Response): Promise<Response> {
        const uuid = parseUuid(req.params.uuid);
        const address = await addressService.getByUuid(uuid);
        return res.status(StatusCodes.OK).json(address);
    }

    public async create(req: Request, res: Response): Promise<Response> {
        const data: CreateAddressDTO = {
            Rua: req.body.Rua,
            Numero: req.body.Numero,
            Complemento: req.body.Complemento,
            Bairro: req.body.Bairro,
            Cep: Number(req.body.Cep),
            Cidade: req.body.Cidade,
            Estado: req.body.Estado,
            Pais: req.body.Pais,
        };
        const address = await addressService.create(data);
        return res.status(StatusCodes.CREATED).json(address);
    }

    public async update(req: Request, res: Response): Promise<Response> {
        const uuid = parseUuid(req.params.uuid);
        const data: UpdateAddressDTO = {
            Rua: req.body.Rua,
            Numero: req.body.Numero,
            Complemento: req.body.Complemento,
            Bairro: req.body.Bairro,
            Cep: req.body.Cep !== undefined ? Number(req.body.Cep) : undefined,
            Cidade: req.body.Cidade,
            Estado: req.body.Estado,
            Pais: req.body.Pais,
        };
        const address = await addressService.update(uuid, data);
        return res.status(StatusCodes.OK).json(address);
    }

    public async remove(req: Request, res: Response): Promise<Response> {
        const uuid = parseUuid(req.params.uuid);
        await addressService.remove(uuid);
        return res.status(StatusCodes.NO_CONTENT).send();
    }
}

export const addressController = new AddressController();
