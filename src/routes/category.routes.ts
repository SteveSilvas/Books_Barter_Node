import { Router } from 'express';
import { categoryController } from '../controllers/CategoryController';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

router.get('/categories', asyncHandler(categoryController.list));
router.post('/categories', asyncHandler(categoryController.create));
router.get('/categories/:id', asyncHandler(categoryController.getById));
router.put('/categories/:id', asyncHandler(categoryController.update));
router.delete('/categories/:id', asyncHandler(categoryController.remove));

export default router;
