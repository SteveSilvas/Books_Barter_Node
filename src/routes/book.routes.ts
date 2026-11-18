import { Router } from 'express';
import { bookController } from '../controllers/BookController';
import { asyncHandler } from '../middlewares/asyncHandler';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

// Catálogo público: qualquer pessoa vê e pesquisa livros por título.
router.get('/books', asyncHandler(bookController.list));
router.get('/books/:uuid', asyncHandler(bookController.getByUuid));

// Estante pessoal: apenas o próprio dono (id vem do token).
router.get('/users/me/books', authenticate, asyncHandler(bookController.listMine));

// Estante pública de outro usuário (Regra 4).
router.get('/users/:uuid/books', asyncHandler(bookController.listByOwner));

// CRUD restrito ao dono.
router.post('/books', authenticate, asyncHandler(bookController.create));
router.put('/books/:uuid', authenticate, asyncHandler(bookController.update));
router.delete('/books/:uuid', authenticate, asyncHandler(bookController.remove));

export default router;
