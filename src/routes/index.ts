import { Router } from 'express';
import addressRoutes from './address.routes';
import bookRoutes from './book.routes';
import bookCopyRoutes from './bookCopy.routes';
import categoryRoutes from './category.routes';
import statusRoutes from './status.routes';
import userRoutes from './user.routes';

const router = Router();

router.use(statusRoutes);
router.use(userRoutes);
router.use(bookRoutes);
router.use(categoryRoutes);
router.use(bookCopyRoutes);
router.use(addressRoutes);

export default router;
