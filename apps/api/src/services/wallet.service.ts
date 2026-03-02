// =====================================================
// WALLET SERVICE — Handles credits, debits, 2× refunds
// =====================================================

import { PrismaClient, TransactionReason } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class WalletService {
  /**
   * Get or create wallet for a user.
   */
  static async getOrCreateWallet(userId: string) {
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId, balance: 0 },
      });
    }

    return wallet;
  }

  /**
   * Get wallet balance.
   */
  static async getBalance(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);
    return { balance: wallet.balance, lastUpdated: wallet.updatedAt };
  }

  /**
   * Credit amount to wallet (refunds, top-ups, promos).
   */
  static async credit(
    userId: string,
    amount: number,
    reason: TransactionReason,
    description?: string,
    rideId?: string
  ) {
    const wallet = await this.getOrCreateWallet(userId);
    const newBalance = wallet.balance + amount;

    const [updatedWallet, transaction] = await prisma.$transaction([
      prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      }),
      prisma.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'CREDIT',
          amount,
          reason,
          description,
          rideId,
          balanceAfter: newBalance,
        },
      }),
    ]);

    return { wallet: updatedWallet, transaction };
  }

  /**
   * Debit amount from wallet (ride payments).
   */
  static async debit(
    userId: string,
    amount: number,
    reason: TransactionReason,
    description?: string,
    rideId?: string
  ) {
    const wallet = await this.getOrCreateWallet(userId);

    if (wallet.balance < amount) {
      throw new AppError('Insufficient wallet balance', 400, 'INSUFFICIENT_BALANCE');
    }

    const newBalance = wallet.balance - amount;

    const [updatedWallet, transaction] = await prisma.$transaction([
      prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      }),
      prisma.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'DEBIT',
          amount,
          reason,
          description,
          rideId,
          balanceAfter: newBalance,
        },
      }),
    ]);

    return { wallet: updatedWallet, transaction };
  }

  /**
   * Get transaction history for a wallet.
   */
  static async getTransactions(userId: string, page: number = 1, pageSize: number = 20) {
    const wallet = await this.getOrCreateWallet(userId);
    const skip = (page - 1) * pageSize;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          ride: {
            select: { shortCode: true, pickupAddress: true, dropAddress: true },
          },
        },
      }),
      prisma.transaction.count({ where: { walletId: wallet.id } }),
    ]);

    return {
      transactions,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}
