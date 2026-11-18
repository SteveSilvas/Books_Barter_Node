import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';

const router = Router();

router.get('/status', (req: Request, res: Response) => {
    return res.status(StatusCodes.OK).json({ status: 'ok', message: 'API em funcionamento.' });
});

export default router;
