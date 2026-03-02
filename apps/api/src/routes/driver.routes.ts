import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateLocationSchema, driverRegistrationSchema } from '@fixedride/shared';
import { RideService } from '../services/ride.service';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();
export const driverRouter = Router();

// All driver routes require authentication
driverRouter.use(authenticate);

// POST /api/v1/driver/register — Register as driver
driverRouter.post(
  '/register',
  validate(driverRegistrationSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Update user role to DRIVER
      await prisma.user.update({
        where: { id: req.userId },
        data: { role: 'DRIVER' },
      });

      const driver = await prisma.driver.create({
        data: {
          userId: req.userId!,
          licenseNumber: req.body.licenseNumber,
          licenseExpiryDate: new Date(req.body.licenseExpiryDate),
          aadhaarNumber: req.body.aadhaarNumber,
          vehicle: {
            create: {
              type: req.body.vehicle.type,
              make: req.body.vehicle.make,
              model: req.body.vehicle.model,
              year: req.body.vehicle.year,
              color: req.body.vehicle.color,
              plateNumber: req.body.vehicle.plateNumber,
            },
          },
        },
        include: { vehicle: true },
      });

      res.status(201).json({ success: true, data: driver });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/driver/go-online
driverRouter.post(
  '/go-online',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const driver = await prisma.driver.update({
        where: { userId: req.userId },
        data: { status: 'ONLINE' },
      });
      res.json({ success: true, data: { status: driver.status } });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/driver/go-offline
driverRouter.post(
  '/go-offline',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const driver = await prisma.driver.update({
        where: { userId: req.userId },
        data: { status: 'OFFLINE' },
      });
      res.json({ success: true, data: { status: driver.status } });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/v1/driver/location — Update GPS location
driverRouter.put(
  '/location',
  validate(updateLocationSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const driver = await prisma.driver.update({
        where: { userId: req.userId },
        data: {
          currentLat: req.body.lat,
          currentLng: req.body.lng,
          lastLocationUpdate: new Date(),
        },
      });
      res.json({ success: true, data: { lat: driver.currentLat, lng: driver.currentLng } });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/driver/accept/:rideId
driverRouter.post(
  '/accept/:rideId',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const driver = await prisma.driver.findUnique({ where: { userId: req.userId } });
      if (!driver) throw new AppError('Driver profile not found', 404, 'DRIVER_NOT_FOUND');

      const ride = await RideService.updateStatus(req.params.rideId, 'DRIVER_ARRIVING', driver.id);
      res.json({ success: true, data: ride });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/driver/arrive/:rideId
driverRouter.post(
  '/arrive/:rideId',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const ride = await prisma.ride.update({
        where: { id: req.params.rideId },
        data: { status: 'DRIVER_ARRIVING', driverArrivedAt: new Date() },
      });
      res.json({ success: true, data: ride });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/driver/start/:rideId — Verify OTP and start ride
driverRouter.post(
  '/start/:rideId',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { otp } = req.body;
      const ride = await prisma.ride.findUnique({ where: { id: req.params.rideId } });

      if (!ride) throw new AppError('Ride not found', 404, 'RIDE_NOT_FOUND');
      if (ride.rideOtp !== otp) throw new AppError('Invalid ride OTP', 400, 'INVALID_RIDE_OTP');

      const updatedRide = await RideService.updateStatus(req.params.rideId, 'IN_PROGRESS');
      res.json({ success: true, data: updatedRide });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/driver/complete/:rideId
driverRouter.post(
  '/complete/:rideId',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const ride = await RideService.updateStatus(req.params.rideId, 'COMPLETED');
      res.json({
        success: true,
        data: {
          ride,
          fare: ride.actualFare,
          message: 'Ride completed. Fixed fare applied.',
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/driver/cancel/:rideId — TRIGGERS 2× REFUND TO RIDER
driverRouter.post(
  '/cancel/:rideId',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const driver = await prisma.driver.findUnique({ where: { userId: req.userId } });
      if (!driver) throw new AppError('Driver not found', 404, 'DRIVER_NOT_FOUND');

      const result = await RideService.driverCancel(
        req.params.rideId,
        driver.id,
        req.body.reason
      );

      res.json({
        success: true,
        data: {
          ride: result.ride,
          refundAmount: result.refundAmount,
          message: `Ride cancelled. ₹${result.refundAmount} (2× refund) credited to rider.`,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/driver/profile — Driver profile and stats
driverRouter.get(
  '/profile',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const driver = await prisma.driver.findUnique({
        where: { userId: req.userId },
        include: {
          user: { select: { name: true, phone: true, email: true, avatarUrl: true } },
          vehicle: true,
        },
      });

      if (!driver) throw new AppError('Driver profile not found', 404, 'DRIVER_NOT_FOUND');
      res.json({ success: true, data: driver });
    } catch (error) {
      next(error);
    }
  }
);
