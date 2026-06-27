import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { signupSchema, loginSchema } from '../validators/auth.validator';

const router = Router();

router.post('/signup', validate(signupSchema), asyncHandler(authController.signup));
router.post('/login', validate(loginSchema), asyncHandler(authController.login));

export default router;
