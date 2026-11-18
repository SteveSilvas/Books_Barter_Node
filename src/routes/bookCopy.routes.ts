import { Router } from 'express';
import { bookCopyController } from '../controllers/BookCopyController';
import { asyncHandler } from '../middlewares/asyncHandler';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

router.get('/book-copies', asyncHandler(bookCopyController.list));
router.post('/book-copies', authenticate, asyncHandler(bookCopyController.create));
router.get('/book-copies/:id', asyncHandler(bookCopyController.getById));
router.put('/book-copies/:id', authenticate, asyncHandler(bookCopyController.update));
router.delete('/book-copies/:id', authenticate, asyncHandler(bookCopyController.remove));

export default router;
