import { Router } from 'express';
import { walletController } from '../controllers/wallet.controller';
import { authenticate } from '../middlewares/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authenticate);
router.get('/', asyncHandler(walletController.getWallet));
router.get('/ledger', asyncHandler(walletController.getLedger));

export default router;
