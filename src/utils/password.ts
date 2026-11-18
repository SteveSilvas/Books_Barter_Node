import { compare, hash } from 'bcryptjs';

const SALT_ROUNDS = 10;

/** Gera o hash de uma senha em texto puro. */
export function hashPassword(plain: string): Promise<string> {
    return hash(plain, SALT_ROUNDS);
}

/** Compara uma senha em texto puro com um hash armazenado. */
export function verifyPassword(plain: string, hashed: string): Promise<boolean> {
    return compare(plain, hashed);
}
