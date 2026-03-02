// =====================================================
// AUTH SERVICE — Phone OTP based authentication
// =====================================================

import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class AuthService {
  /**
   * Send OTP to phone number.
   * In dev mode, OTP is logged to console.
   */
  static async sendOtp(phone: string) {
    // Rate limiting check
    const recentOtps = await prisma.otpCode.count({
      where: {
        phone,
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }, // Last hour
      },
    });

    if (recentOtps >= config.otp.rateLimitPerHour) {
      throw new AppError('Too many OTP requests. Try again later.', 429, 'OTP_RATE_LIMITED');
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + config.otp.expiryMinutes * 60 * 1000);

    // Find or create user
    let user = await prisma.user.findUnique({ where: { phone } });

    // Store OTP
    await prisma.otpCode.create({
      data: {
        phone,
        code,
        expiresAt,
        userId: user?.id,
      },
    });

    // Send OTP based on provider
    if (config.otp.provider === 'console') {
      console.log(`📱 OTP for ${phone}: ${code}`);
    }
    // TODO: Add MSG91/Twilio integration

    return { message: 'OTP sent successfully', expiresInSeconds: config.otp.expiryMinutes * 60 };
  }

  /**
   * Verify OTP and return JWT tokens.
   */
  static async verifyOtp(phone: string, code: string) {
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        phone,
        code,
        isUsed: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new AppError('Invalid or expired OTP', 400, 'INVALID_OTP');
    }

    if (otpRecord.attempts >= config.otp.maxAttempts) {
      throw new AppError('Too many attempts. Request a new OTP.', 400, 'OTP_MAX_ATTEMPTS');
    }

    // Mark OTP as used
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    // Find or create user
    let user = await prisma.user.findUnique({ where: { phone } });
    const isNewUser = !user;

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          isVerified: true,
          wallet: { create: { balance: 0 } },
        },
      });
    } else if (!user.isVerified) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiry }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, role: user.role },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiry }
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        role: user.role,
        isNewUser,
      },
    };
  }

  /**
   * Refresh access token.
   */
  static async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as {
        userId: string;
        role: string;
      };

      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!user || !user.isActive) {
        throw new AppError('User not found or inactive', 401, 'USER_INACTIVE');
      }

      const accessToken = jwt.sign(
        { userId: user.id, role: user.role },
        config.jwt.accessSecret,
        { expiresIn: config.jwt.accessExpiry }
      );

      return { accessToken };
    } catch {
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }
  }
}
