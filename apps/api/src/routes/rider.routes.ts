import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { fareEstimateSchema, bookRideSchema, ratingSchema, paginationSchema } from '@fixedride/shared';
import { FareService } from '../services/fare.service';
import { RideService } from '../services/ride.service';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();
export const riderRouter = Router();

// All rider routes require authentication
riderRouter.use(authenticate);

// GET /api/v1/rider/fare-estimate
riderRouter.get(
  '/fare-estimate',
  validate(fareEstimateSchema, 'query'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { pickup, drop, vehicleType } = req.query as any;

      const distanceKm = FareService.calculateDistance(
        parseFloat(pickup.lat),
        parseFloat(pickup.lng),
        parseFloat(drop.lat),
        parseFloat(drop.lng)
      );

      const estimate = await FareService.calculateFare(distanceKm, vehicleType);
      const allEstimates = await FareService.getAllFareEstimates(distanceKm);

      res.json({
        success: true,
        data: {
          distanceKm,
          selected: estimate,
          allOptions: allEstimates,
          // Explicitly documenting: no surge info here because there IS no surge
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/rider/book
riderRouter.post(
  '/book',
  validate(bookRideSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const ride = await RideService.bookRide({
        riderId: req.userId!,
        pickupLat: req.body.pickup.lat,
        pickupLng: req.body.pickup.lng,
        pickupAddress: req.body.pickup.address,
        dropLat: req.body.drop.lat,
        dropLng: req.body.drop.lng,
        dropAddress: req.body.drop.address,
        vehicleType: req.body.vehicleType,
        paymentMethod: req.body.paymentMethod,
        isShared: req.body.isShared,
        isScheduled: req.body.isScheduled,
        scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : undefined,
      });

      // Attempt to match with a driver
      const matchedRide = await RideService.matchDriver(ride.id);

      res.status(201).json({
        success: true,
        data: matchedRide || ride,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/rider/cancel/:rideId — ALWAYS FREE (₹0)
riderRouter.post(
  '/cancel/:rideId',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const ride = await RideService.riderCancel(req.params.rideId, req.userId!);
      res.json({
        success: true,
        data: {
          ride,
          cancellationFee: 0, // ALWAYS ZERO — Core USP
          message: 'Ride cancelled. No cancellation fee charged.',
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/rider/rides — Ride history
riderRouter.get(
  '/rides',
  validate(paginationSchema, 'query'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { page, pageSize } = req.query as any;
      const result = await RideService.getRideHistory(req.userId!, page, pageSize);
      res.json({ success: true, data: result.rides, meta: result.meta });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/rider/ride/:id — Ride details
riderRouter.get(
  '/ride/:id',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const ride = await RideService.getRideById(req.params.id);
      if (!ride) throw new AppError('Ride not found', 404, 'RIDE_NOT_FOUND');
      if (ride.riderId !== req.userId) throw new AppError('Not your ride', 403, 'FORBIDDEN');
      res.json({ success: true, data: ride });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/rider/rate/:rideId — Rate a ride
riderRouter.post(
  '/rate/:rideId',
  validate(ratingSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const ride = await prisma.ride.findUnique({
        where: { id: req.params.rideId },
        include: { driver: true },
      });

      if (!ride) throw new AppError('Ride not found', 404, 'RIDE_NOT_FOUND');
      if (ride.riderId !== req.userId) throw new AppError('Not your ride', 403, 'FORBIDDEN');
      if (ride.status !== 'COMPLETED') {
        throw new AppError('Can only rate completed rides', 400, 'RIDE_NOT_COMPLETED');
      }

      const rating = await prisma.rating.create({
        data: {
          rideId: ride.id,
          fromUserId: req.userId!,
          toUserId: ride.driver!.userId,
          stars: req.body.stars,
          comment: req.body.comment,
        },
      });

      // Update driver average rating
      const avgRating = await prisma.rating.aggregate({
        where: { toUserId: ride.driver!.userId },
        _avg: { stars: true },
      });

      await prisma.driver.update({
        where: { id: ride.driverId! },
        data: { averageRating: avgRating._avg.stars || 5.0 },
      });

      res.json({ success: true, data: rating });
    } catch (error) {
      next(error);
    }
  }
);
