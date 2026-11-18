import { Router } from 'express';
import { addressController } from '../controllers/AddressController';
import { asyncHandler } from '../middlewares/asyncHandler';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

router.get('/addresses', asyncHandler(addressController.list));
router.post('/addresses', authenticate, asyncHandler(addressController.create));
router.get('/addresses/:uuid', asyncHandler(addressController.getByUuid));
router.put('/addresses/:uuid', authenticate, asyncHandler(addressController.update));
router.delete('/addresses/:uuid', authenticate, asyncHandler(addressController.remove));

export default router;
