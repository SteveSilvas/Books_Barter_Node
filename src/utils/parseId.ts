import { StatusCodes } from 'http-status-codes';
import { AppError } from '../errors/AppError';

/**
 * Converte um parâmetro de rota em número inteiro positivo.
 * Lança 400 caso o valor seja inválido.
 */
export function parseId(value: string, field = 'Id'): number {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new AppError(`${field} inválido: ${value}`, StatusCodes.BAD_REQUEST);
    }
    return parsed;
}
