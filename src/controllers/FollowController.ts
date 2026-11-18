import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { followService } from '../services/FollowService';
import { parseUuid } from '../utils/parseId';
import { parsePagination, parseSort } from '../utils/query';

const USER_SORT_FIELDS = ['createdAt', 'updatedAt', 'Name'] as const;

export class FollowController {
    /** Segue o usuário identificado pelo UUID. */
    public async follow(req: Request, res: Response): Promise<Response> {
        const uuid = parseUuid(req.params.uuid, 'Uuid do usuário');
        await followService.follow(req.user!.Id, uuid);
        return res.status(StatusCodes.NO_CONTENT).send();
    }

    public async unfollow(req: Request, res: Response): Promise<Response> {
        const uuid = parseUuid(req.params.uuid, 'Uuid do usuário');
        await followService.unfollow(req.user!.Id, uuid);
        return res.status(StatusCodes.NO_CONTENT).send();
    }

    public async listFollowers(req: Request, res: Response): Promise<Response> {
        const uuid = parseUuid(req.params.uuid, 'Uuid do usuário');
        const pagination = parsePagination(req.query.limit, req.query.offset);
        const sort = parseSort(req.query.sort, req.query.order, {
            fields: USER_SORT_FIELDS,
        });
        const page = await followService.listFollowers(uuid, pagination, sort);
        return res.status(StatusCodes.OK).json(page);
    }

    public async listFollowing(req: Request, res: Response): Promise<Response> {
        const uuid = parseUuid(req.params.uuid, 'Uuid do usuário');
        const pagination = parsePagination(req.query.limit, req.query.offset);
        const sort = parseSort(req.query.sort, req.query.order, {
            fields: USER_SORT_FIELDS,
        });
        const page = await followService.listFollowing(uuid, pagination, sort);
        return res.status(StatusCodes.OK).json(page);
    }
}

export const followController = new FollowController();
