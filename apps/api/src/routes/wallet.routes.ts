import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { topUpSchema, paginationSchema } from '@fixedride/shared';
import { WalletService } from '../services/wallet.service';

export const walletRouter = Router();

walletRouter.use(authenticate);

// GET /api/v1/wallet/balance
walletRouter.get(
  '/balance',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const balance = await WalletService.getBalance(req.userId!);
      res.json({ success: true, data: balance });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/wallet/transactions
walletRouter.get(
  '/transactions',
  validate(paginationSchema, 'query'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { page, pageSize } = req.query as any;
      const result = await WalletService.getTransactions(req.userId!, page, pageSize);
      res.json({ success: true, data: result.transactions, meta: result.meta });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/wallet/topup
walletRouter.post(
  '/topup',
  validate(topUpSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // TODO: Integrate with Razorpay for actual payment
      // For now, directly credit the wallet (dev mode)
      const result = await WalletService.credit(
        req.userId!,
        req.body.amount,
        'TOP_UP',
        `Wallet top-up via ${req.body.paymentMethod}`
      );

      res.json({
        success: true,
        data: {
          balance: result.wallet.balance,
          transaction: result.transaction,
          message: `₹${req.body.amount} added to wallet`,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);
