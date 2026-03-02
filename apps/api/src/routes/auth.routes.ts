import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { validate } from '../middleware/validate';
import { sendOtpSchema, verifyOtpSchema } from '@fixedride/shared';

export const authRouter = Router();

// POST /api/v1/auth/send-otp
authRouter.post(
  '/send-otp',
  validate(sendOtpSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await AuthService.sendOtp(req.body.phone);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/auth/verify-otp
authRouter.post(
  '/verify-otp',
  validate(verifyOtpSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await AuthService.verifyOtp(req.body.phone, req.body.code);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/auth/refresh
authRouter.post(
  '/refresh',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_TOKEN', message: 'Refresh token required' },
        });
      }
      const result = await AuthService.refreshToken(refreshToken);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);
