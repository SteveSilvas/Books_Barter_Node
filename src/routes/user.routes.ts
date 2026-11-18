import { Router } from 'express';
import { userController } from '../controllers/UserController';
import { asyncHandler } from '../middlewares/asyncHandler';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

// Rotas públicas: cadastro e login.
router.post('/users', asyncHandler(userController.create));
router.post('/users/login', asyncHandler(userController.login));
router.post('/users/google', asyncHandler(userController.loginWithGoogle));

// Perfil do próprio usuário autenticado.
router.get('/users/me', authenticate, asyncHandler(userController.me));

router.get('/users', asyncHandler(userController.list));
router.get('/users/email/:email', asyncHandler(userController.getByEmail));
router.get('/users/:id', asyncHandler(userController.getById));
router.put('/users/:id', authenticate, asyncHandler(userController.update));
router.delete('/users/:id', authenticate, asyncHandler(userController.remove));

export default router;
