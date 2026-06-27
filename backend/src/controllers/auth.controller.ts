import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { SignupInput, LoginInput } from '../validators/auth.validator';

export const authController = {
  async signup(req: Request, res: Response) {
    const { email, password } = req.body as SignupInput;
    const result = await authService.signup(email, password);
    res.status(201).json(result);
  },

  async login(req: Request, res: Response) {
    const { email, password } = req.body as LoginInput;
    const result = await authService.login(email, password);
    res.status(200).json(result);
  },
};
