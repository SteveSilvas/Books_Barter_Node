import cors from 'cors';
import express, { Express } from 'express';
import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFoundHandler';
import routes from './routes';

export function createApp(): Express {
    const app = express();

    app.use(cors());
    app.use(express.json());
    app.use(express.static('public'));

    app.use(routes);

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}
