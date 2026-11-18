import { Router } from 'express';
import { favoriteController } from '../controllers/FavoriteController';
import { followController } from '../controllers/FollowController';
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

// Favoritos do próprio usuário (Regra 6) — antes das rotas com `:uuid`.
router.get(
    '/users/me/favorites/shelves',
    authenticate,
    asyncHandler(favoriteController.listShelves),
);
router.get(
    '/users/me/favorites/books',
    authenticate,
    asyncHandler(favoriteController.listBooks),
);

// Perfis públicos (apenas dados não sensíveis).
router.get('/users', asyncHandler(userController.list));
router.get('/users/email/:email', asyncHandler(userController.getByEmail));

// Seguir/deixar de seguir e listagens de relacionamento (Regra 5).
router.get('/users/:uuid/followers', asyncHandler(followController.listFollowers));
router.get('/users/:uuid/following', asyncHandler(followController.listFollowing));
router.post('/users/:uuid/follow', authenticate, asyncHandler(followController.follow));
router.delete(
    '/users/:uuid/follow',
    authenticate,
    asyncHandler(followController.unfollow),
);

// Favoritar/desfavoritar a estante de um usuário (Regra 6).
router.post(
    '/users/:uuid/favorite',
    authenticate,
    asyncHandler(favoriteController.favoriteShelf),
);
router.delete(
    '/users/:uuid/favorite',
    authenticate,
    asyncHandler(favoriteController.unfavoriteShelf),
);

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
