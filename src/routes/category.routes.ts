import { Router } from 'express';
import { categoryController } from '../controllers/CategoryController';
import { asyncHandler } from '../middlewares/asyncHandler';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

router.get('/categories', asyncHandler(categoryController.list));
router.post('/categories', authenticate, asyncHandler(categoryController.create));
router.get('/categories/:id', asyncHandler(categoryController.getById));
router.put('/categories/:id', authenticate, asyncHandler(categoryController.update));
router.delete('/categories/:id', authenticate, asyncHandler(categoryController.remove));

export default router;
