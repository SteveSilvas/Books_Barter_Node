import 'express';

export interface AuthUser {
    Id: number;
    Uuid: string;
    Email: string;
}

declare global {
    namespace Express {
        interface Request {
            /** Preenchido pelo middleware `authenticate`. */
            user?: AuthUser;
        }
    }
}
