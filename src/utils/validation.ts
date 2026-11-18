import { StatusCodes } from 'http-status-codes';
import { AppError } from '../errors/AppError';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Valida e normaliza um nome não vazio. */
export function parseName(value: unknown): string {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new AppError('Nome é obrigatório.', StatusCodes.BAD_REQUEST);
    }
    return value.trim();
}

/** Valida e normaliza um e-mail (minúsculas, sem espaços nas pontas). */
export function parseEmail(value: unknown): string {
    if (typeof value !== 'string' || !EMAIL_REGEX.test(value.trim())) {
        throw new AppError('E-mail inválido.', StatusCodes.BAD_REQUEST);
    }
    return value.trim().toLowerCase();
}

/** Normaliza um e-mail para busca, sem validar formato. */
export function normalizeEmail(value: string): string {
    return value.trim().toLowerCase();
}

/** Converte uma data de nascimento; `null`/vazio limpam o campo. */
export function parseBirth(value: unknown): Date | null {
    if (value === undefined || value === null || value === '') {
        return null;
    }
    const date = value instanceof Date ? value : new Date(String(value));
    if (Number.isNaN(date.getTime())) {
        throw new AppError(
            'Data de nascimento inválida.',
            StatusCodes.BAD_REQUEST,
        );
    }
    return date;
}

/** Valida uma senha não vazia. */
export function parsePassword(value: unknown): string {
    if (typeof value !== 'string' || value.length === 0) {
        throw new AppError('Senha é obrigatória.', StatusCodes.BAD_REQUEST);
    }
    return value;
}
