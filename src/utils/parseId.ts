import { StatusCodes } from 'http-status-codes';
import { AppError } from '../errors/AppError';

/** Tipo dos parâmetros de rota no Express 5. */
export type RouteParam = string | string[] | undefined;

/**
 * Normaliza um parâmetro de rota para string única.
 * Lança 400 se estiver ausente ou repetido (array).
 */
export function parseParam(value: RouteParam, field = 'Parâmetro'): string {
    if (typeof value !== 'string' || value.length === 0) {
        throw new AppError(`${field} inválido.`, StatusCodes.BAD_REQUEST);
    }
    return value;
}

/**
 * Converte um parâmetro de rota em número inteiro positivo.
 * Lança 400 caso o valor seja inválido.
 */
export function parseId(value: RouteParam, field = 'Id'): number {
    const text = parseParam(value, field);
    const parsed = Number(text);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new AppError(`${field} inválido: ${text}`, StatusCodes.BAD_REQUEST);
    }
    return parsed;
}
