import { StatusCodes } from 'http-status-codes';
import { AppError } from '../errors/AppError';
import { BOOK_STATUS_SEED, BookStatusName } from '../models/BookStatus';

/** Valor de query string (o Express 5 entrega `ParsedQs`); validado ao ler. */
export type QueryValue = unknown;

export interface Pagination {
    limit: number;
    offset: number;
}

export interface PageMeta extends Pagination {
    total: number;
    count: number;
    hasMore: boolean;
}

/** Envelope padrão das listagens paginadas. */
export interface Paged<T> {
    data: T[];
    meta: PageMeta;
}

export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 50;

/** Campos pelos quais o catálogo pode ser ordenado (allowlist). */
export const BOOK_SORT_FIELDS = [
    'createdAt',
    'updatedAt',
    'Title',
    'Autor',
] as const;

export type BookSortField = (typeof BOOK_SORT_FIELDS)[number];
export type SortOrder = 'asc' | 'desc';

export interface SortSpec {
    field: string;
    order: SortOrder;
}

const DEFAULT_SORT_FIELD: BookSortField = 'createdAt';
const DEFAULT_SORT_ORDER: SortOrder = 'desc';

/** Opções da allowlist de ordenação (defaults: campos de livro). */
export interface SortOptions {
    fields?: readonly string[];
    defaultField?: string;
    defaultOrder?: SortOrder;
}

const BOOK_STATUS_NAMES = BOOK_STATUS_SEED.map((status) => status.Name);

function single(value: QueryValue, field: string): string | undefined {
    if (value === undefined) {
        return undefined;
    }
    if (typeof value !== 'string' || value.length === 0) {
        throw new AppError(`${field} inválido.`, StatusCodes.BAD_REQUEST);
    }
    return value;
}

/** Lê `limit` (1..MAX_LIMIT) e `offset` (>=0) da query; aplica defaults. */
export function parsePagination(
    limitRaw: QueryValue,
    offsetRaw: QueryValue,
): Pagination {
    let limit = DEFAULT_LIMIT;
    if (limitRaw !== undefined) {
        const parsed = Number(single(limitRaw, 'limit'));
        if (!Number.isInteger(parsed) || parsed <= 0 || parsed > MAX_LIMIT) {
            throw new AppError(
                `limit inválido: use um inteiro entre 1 e ${MAX_LIMIT}.`,
                StatusCodes.BAD_REQUEST,
            );
        }
        limit = parsed;
    }

    let offset = 0;
    if (offsetRaw !== undefined) {
        const parsed = Number(single(offsetRaw, 'offset'));
        if (!Number.isInteger(parsed) || parsed < 0) {
            throw new AppError(
                'offset inválido: use um inteiro maior ou igual a 0.',
                StatusCodes.BAD_REQUEST,
            );
        }
        offset = parsed;
    }

    return { limit, offset };
}

/** Monta os metadados de paginação a partir do total e da página atual. */
export function buildPageMeta(
    total: number,
    pagination: Pagination,
    count: number,
): PageMeta {
    const { limit, offset } = pagination;
    return { limit, offset, total, count, hasMore: offset + count < total };
}

/** Lê `sort`/`order` (allowlist) com defaults `createdAt desc`. */
export function parseSort(
    sortRaw: QueryValue,
    orderRaw: QueryValue,
    options: SortOptions = {},
): SortSpec {
    const fields = options.fields ?? BOOK_SORT_FIELDS;
    const defaultField = options.defaultField ?? DEFAULT_SORT_FIELD;
    const defaultOrder = options.defaultOrder ?? DEFAULT_SORT_ORDER;

    const sortValue = single(sortRaw, 'sort');
    const orderValue = single(orderRaw, 'order');

    let field: string = defaultField;
    if (sortValue !== undefined) {
        if (!fields.includes(sortValue)) {
            throw new AppError(
                `sort inválido: use um de ${fields.join(', ')}.`,
                StatusCodes.BAD_REQUEST,
            );
        }
        field = sortValue;
    }

    let order: SortOrder = defaultOrder;
    if (orderValue !== undefined) {
        if (orderValue !== 'asc' && orderValue !== 'desc') {
            throw new AppError(
                'order inválido: use "asc" ou "desc".',
                StatusCodes.BAD_REQUEST,
            );
        }
        order = orderValue;
    }

    return { field, order };
}

export interface BookQuery {
    title?: string;
    categoryUuid?: string;
    ownerUuid?: string;
    status?: BookStatusName;
}

/** Lê e valida os filtros do catálogo/estante a partir da query string. */
export function parseBookQuery(query: Record<string, unknown>): BookQuery {
    const filter: BookQuery = {};

    const title = single(query.title, 'title');
    if (title !== undefined) {
        filter.title = title;
    }

    const categoryUuid = single(query.categoryUuid, 'categoryUuid');
    if (categoryUuid !== undefined) {
        filter.categoryUuid = categoryUuid;
    }

    const ownerUuid = single(query.ownerUuid, 'ownerUuid');
    if (ownerUuid !== undefined) {
        filter.ownerUuid = ownerUuid;
    }

    const status = single(query.status, 'status');
    if (status !== undefined) {
        if (!BOOK_STATUS_NAMES.includes(status as BookStatusName)) {
            throw new AppError(
                `status inválido: use um de ${BOOK_STATUS_NAMES.join(', ')}.`,
                StatusCodes.BAD_REQUEST,
            );
        }
        filter.status = status as BookStatusName;
    }

    return filter;
}
