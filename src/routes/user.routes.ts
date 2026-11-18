import { Router } from 'express';
import { userController } from '../controllers/UserController';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

router.get('/users', asyncHandler(userController.list));
router.post('/users', asyncHandler(userController.create));
router.post('/users/login', asyncHandler(userController.login));
router.get('/users/email/:email', asyncHandler(userController.getByEmail));
router.get('/users/:id', asyncHandler(userController.getById));
router.put('/users/:id', asyncHandler(userController.update));
router.delete('/users/:id', asyncHandler(userController.remove));

export default router;
