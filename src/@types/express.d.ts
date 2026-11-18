import 'express';

export interface AuthUser {
    Id: number;
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
