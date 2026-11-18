import { Router } from 'express';
import { addressController } from '../controllers/AddressController';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

router.get('/addresses', asyncHandler(addressController.list));
router.post('/addresses', asyncHandler(addressController.create));
router.get('/addresses/:id', asyncHandler(addressController.getById));
router.put('/addresses/:id', asyncHandler(addressController.update));
router.delete('/addresses/:id', asyncHandler(addressController.remove));

export default router;
