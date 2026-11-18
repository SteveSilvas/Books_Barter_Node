import { Router } from 'express';
import { bookController } from '../controllers/BookController';
import { asyncHandler } from '../middlewares/asyncHandler';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

router.get('/books', asyncHandler(bookController.list));
router.post('/books', authenticate, asyncHandler(bookController.create));
router.get('/books/:id', asyncHandler(bookController.getById));
router.put('/books/:id', authenticate, asyncHandler(bookController.update));
router.delete('/books/:id', authenticate, asyncHandler(bookController.remove));

export default router;
