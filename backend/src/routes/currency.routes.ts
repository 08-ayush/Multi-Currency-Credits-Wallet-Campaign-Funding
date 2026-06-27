import { Router } from 'express';
import { currencyController } from '../controllers/currency.controller';
import { authenticate } from '../middlewares/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', authenticate, asyncHandler(currencyController.list));

export default router;
