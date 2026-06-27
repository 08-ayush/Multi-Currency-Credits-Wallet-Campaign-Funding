import { Request, Response } from 'express';
import { walletService } from '../services/wallet.service';

export const walletController = {
  async getWallet(req: Request, res: Response) {
    const wallet = await walletService.getWallet(req.user!.userId);
    res.json(wallet);
  },

  async getLedger(req: Request, res: Response) {
    const ledger = await walletService.getLedger(req.user!.userId);
    res.json({ ledger });
  },
};
