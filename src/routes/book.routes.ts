import { Router } from 'express';
import { bookController } from '../controllers/BookController';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

router.get('/books', asyncHandler(bookController.list));
router.post('/books', asyncHandler(bookController.create));
router.get('/books/:id', asyncHandler(bookController.getById));
router.put('/books/:id', asyncHandler(bookController.update));
router.delete('/books/:id', asyncHandler(bookController.remove));

export default router;
