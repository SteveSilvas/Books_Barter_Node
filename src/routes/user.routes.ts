import { Router } from 'express';
import { userController } from '../controllers/UserController';
import { asyncHandler } from '../middlewares/asyncHandler';
import { authenticate } from '../middlewares/authenticate';
import { authorizeSelf } from '../middlewares/authorizeSelf';

const router = Router();

// Rotas públicas: cadastro e login.
router.post('/users', asyncHandler(userController.create));
router.post('/users/login', asyncHandler(userController.login));
router.post('/users/google', asyncHandler(userController.loginWithGoogle));

// Perfil do próprio usuário autenticado (Regra 2).
router.get('/users/me', authenticate, asyncHandler(userController.me));
router.put('/users/me', authenticate, asyncHandler(userController.updateMe));

// Perfis públicos (apenas dados não sensíveis).
router.get('/users', asyncHandler(userController.list));
router.get('/users/email/:email', asyncHandler(userController.getByEmail));
router.get('/users/:uuid', asyncHandler(userController.getByUuid));

// Edição/remoção restritas ao dono do recurso.
router.put(
    '/users/:uuid',
    authenticate,
    authorizeSelf,
    asyncHandler(userController.update),
);
router.delete(
    '/users/:uuid',
    authenticate,
    authorizeSelf,
    asyncHandler(userController.remove),
);

export default router;
