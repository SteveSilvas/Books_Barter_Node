import { Router } from 'express';
import { addressController } from '../controllers/AddressController';
import { asyncHandler } from '../middlewares/asyncHandler';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

router.get('/addresses', asyncHandler(addressController.list));
router.post('/addresses', authenticate, asyncHandler(addressController.create));
router.get('/addresses/:id', asyncHandler(addressController.getById));
router.put('/addresses/:id', authenticate, asyncHandler(addressController.update));
router.delete('/addresses/:id', authenticate, asyncHandler(addressController.remove));

export default router;
