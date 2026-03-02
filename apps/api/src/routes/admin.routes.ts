import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateFareMatrixSchema, paginationSchema } from '@fixedride/shared';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const adminRouter = Router();

// All admin routes require ADMIN role
adminRouter.use(authenticate);
adminRouter.use(requireRole('ADMIN'));

// GET /api/v1/admin/analytics — Dashboard metrics
adminRouter.get(
  '/analytics',
  async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const [totalRides, completedRides, cancelledRides, totalRiders, totalDrivers, onlineDrivers] =
        await Promise.all([
          prisma.ride.count(),
          prisma.ride.count({ where: { status: 'COMPLETED' } }),
          prisma.ride.count({ where: { status: 'CANCELLED' } }),
          prisma.user.count({ where: { role: 'RIDER' } }),
          prisma.driver.count(),
          prisma.driver.count({ where: { status: 'ONLINE' } }),
        ]);

      // Revenue from completed rides
      const revenue = await prisma.ride.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { actualFare: true },
      });

      // Total refunds issued (2× refunds)
      const refunds = await prisma.transaction.aggregate({
        where: { reason: 'REFUND_2X' },
        _sum: { amount: true },
        _count: true,
      });

      res.json({
        success: true,
        data: {
          rides: { total: totalRides, completed: completedRides, cancelled: cancelledRides },
          users: { riders: totalRiders, drivers: totalDrivers, onlineDrivers },
          revenue: { total: revenue._sum.actualFare || 0 },
          refunds: {
            total: refunds._sum.amount || 0,
            count: refunds._count,
            reason: '2× refund on platform/driver cancel (Core USP)',
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/admin/rides — All rides with filters
adminRouter.get(
  '/rides',
  validate(paginationSchema, 'query'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { page, pageSize } = req.query as any;
      const skip = (page - 1) * pageSize;

      const [rides, total] = await Promise.all([
        prisma.ride.findMany({
          orderBy: { createdAt: 'desc' },
          skip,
          take: pageSize,
          include: {
            rider: { select: { name: true, phone: true } },
            driver: {
              include: {
                user: { select: { name: true, phone: true } },
              },
            },
          },
        }),
        prisma.ride.count(),
      ]);

      res.json({
        success: true,
        data: rides,
        meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/v1/admin/fare-matrix — Update fare rates
// NOTE: No surge multiplier field accepted. Fixed fare only.
adminRouter.put(
  '/fare-matrix',
  validate(updateFareMatrixSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const fareMatrix = await prisma.fareMatrix.upsert({
        where: { vehicleType: req.body.vehicleType },
        update: {
          baseFare: req.body.baseFare,
          perKmRate: req.body.perKmRate,
          perMinRate: req.body.perMinRate,
          minimumFare: req.body.minimumFare,
          updatedBy: req.userId,
          // NO surgeMultiplier update — field doesn't exist
        },
        create: {
          vehicleType: req.body.vehicleType,
          baseFare: req.body.baseFare,
          perKmRate: req.body.perKmRate,
          perMinRate: req.body.perMinRate,
          minimumFare: req.body.minimumFare,
          updatedBy: req.userId,
        },
      });

      res.json({
        success: true,
        data: fareMatrix,
        message: 'Fare matrix updated. Fixed fare applied 24×7 across all locations.',
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/admin/drivers — Driver management
adminRouter.get(
  '/drivers',
  async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const drivers = await prisma.driver.findMany({
        include: {
          user: { select: { name: true, phone: true, email: true, createdAt: true } },
          vehicle: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, data: drivers });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/admin/drivers/:driverId/approve
adminRouter.post(
  '/drivers/:driverId/approve',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const driver = await prisma.driver.update({
        where: { id: req.params.driverId },
        data: { isApproved: true },
      });
      res.json({ success: true, data: driver });
    } catch (error) {
      next(error);
    }
  }
);
