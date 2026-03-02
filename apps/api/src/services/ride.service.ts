// =====================================================
// RIDE SERVICE — Ride lifecycle management
// =====================================================

import { PrismaClient, RideStatus, VehicleType, PaymentMethod } from '@prisma/client';
import { FareService } from './fare.service';
import { WalletService } from './wallet.service';
import { AppError } from '../middleware/errorHandler';
import {
  PLATFORM_CANCEL_REFUND_MULTIPLIER,
  RIDER_CANCELLATION_FEE,
  MAX_SCHEDULE_ADVANCE_HOURS,
} from '@fixedride/shared';

const prisma = new PrismaClient();

interface BookRideInput {
  riderId: string;
  pickupLat: number;
  pickupLng: number;
  pickupAddress: string;
  dropLat: number;
  dropLng: number;
  dropAddress: string;
  vehicleType: VehicleType;
  paymentMethod: PaymentMethod;
  isShared?: boolean;
  isScheduled?: boolean;
  scheduledAt?: Date;
}

export class RideService {
  /**
   * Book a new ride with FIXED fare.
   */
  static async bookRide(input: BookRideInput) {
    // Calculate distance
    const distanceKm = FareService.calculateDistance(
      input.pickupLat,
      input.pickupLng,
      input.dropLat,
      input.dropLng
    );

    // Calculate FIXED fare (no surge, no time modifier)
    const fareCalc = await FareService.calculateFare(
      distanceKm,
      input.vehicleType,
      input.isShared
    );

    // Validate scheduling
    if (input.isScheduled && input.scheduledAt) {
      const now = new Date();
      const maxAdvance = MAX_SCHEDULE_ADVANCE_HOURS * 60 * 60 * 1000;
      if (input.scheduledAt.getTime() - now.getTime() > maxAdvance) {
        throw new AppError(
          `Cannot schedule more than ${MAX_SCHEDULE_ADVANCE_HOURS} hours in advance`,
          400,
          'SCHEDULE_TOO_FAR'
        );
      }
    }

    // Generate ride OTP (4-digit)
    const rideOtp = Math.floor(1000 + Math.random() * 9000).toString();

    // Generate short code
    const shortCode = `FR-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Create ride
    const ride = await prisma.ride.create({
      data: {
        shortCode,
        riderId: input.riderId,
        vehicleType: input.vehicleType,
        pickupLat: input.pickupLat,
        pickupLng: input.pickupLng,
        pickupAddress: input.pickupAddress,
        dropLat: input.dropLat,
        dropLng: input.dropLng,
        dropAddress: input.dropAddress,
        distanceKm,
        estimatedFare: fareCalc.estimatedFare,
        isShared: input.isShared || false,
        isScheduled: input.isScheduled || false,
        scheduledAt: input.scheduledAt,
        paymentMethod: input.paymentMethod,
        rideOtp,
        status: 'REQUESTED',
      },
      include: {
        rider: { select: { id: true, name: true, phone: true } },
      },
    });

    return ride;
  }

  /**
   * Rider cancels ride — ALWAYS FREE (₹0 cancellation fee).
   * This is a core USP. No penalty, no window, no exceptions.
   */
  static async riderCancel(rideId: string, riderId: string) {
    const ride = await prisma.ride.findUnique({ where: { id: rideId } });

    if (!ride) throw new AppError('Ride not found', 404, 'RIDE_NOT_FOUND');
    if (ride.riderId !== riderId) throw new AppError('Not your ride', 403, 'FORBIDDEN');
    if (['COMPLETED', 'CANCELLED'].includes(ride.status)) {
      throw new AppError('Cannot cancel this ride', 400, 'INVALID_STATUS');
    }

    // Cancel with ZERO fee — core USP
    const updatedRide = await prisma.ride.update({
      where: { id: rideId },
      data: {
        status: 'CANCELLED',
        cancelledBy: 'RIDER',
        cancelledAt: new Date(),
        // Cancellation fee is ALWAYS ₹0: RIDER_CANCELLATION_FEE = 0
      },
    });

    // Release driver if assigned
    if (ride.driverId) {
      await prisma.driver.update({
        where: { id: ride.driverId },
        data: { status: 'ONLINE' },
      });
    }

    console.log(`Ride ${rideId} cancelled by rider. Fee: ₹${RIDER_CANCELLATION_FEE} (always zero)`);
    return updatedRide;
  }

  /**
   * Driver/System cancels ride — TRIGGERS 2× REFUND.
   * This is a core USP. Rider gets 2× estimated fare credited.
   */
  static async driverCancel(rideId: string, driverId: string, reason?: string) {
    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      include: { driver: true },
    });

    if (!ride) throw new AppError('Ride not found', 404, 'RIDE_NOT_FOUND');
    if (ride.driverId !== driverId) throw new AppError('Not your ride', 403, 'FORBIDDEN');
    if (['COMPLETED', 'CANCELLED'].includes(ride.status)) {
      throw new AppError('Cannot cancel this ride', 400, 'INVALID_STATUS');
    }

    // Cancel ride
    const updatedRide = await prisma.ride.update({
      where: { id: rideId },
      data: {
        status: 'CANCELLED',
        cancelledBy: 'DRIVER',
        cancelReason: reason,
        cancelledAt: new Date(),
      },
    });

    // Release driver
    await prisma.driver.update({
      where: { id: driverId },
      data: { status: 'ONLINE' },
    });

    // 2× REFUND — Core USP
    const refundAmount = ride.estimatedFare * PLATFORM_CANCEL_REFUND_MULTIPLIER;
    await WalletService.credit(
      ride.riderId,
      refundAmount,
      'REFUND_2X',
      `2× refund for cancelled ride ${ride.shortCode}`,
      rideId
    );

    console.log(
      `Ride ${rideId} cancelled by driver. 2× refund of ₹${refundAmount} credited to rider.`
    );

    return { ride: updatedRide, refundAmount };
  }

  /**
   * Match ride with nearest available driver.
   */
  static async matchDriver(rideId: string) {
    const ride = await prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) throw new AppError('Ride not found', 404, 'RIDE_NOT_FOUND');

    // Find nearest online drivers
    const availableDrivers = await prisma.driver.findMany({
      where: {
        status: 'ONLINE',
        isApproved: true,
        vehicle: { type: ride.vehicleType },
        currentLat: { not: null },
        currentLng: { not: null },
      },
      include: {
        vehicle: true,
        user: { select: { id: true, name: true, phone: true, avatarUrl: true } },
      },
    });

    if (availableDrivers.length === 0) {
      return null; // No drivers available
    }

    // Sort by distance to pickup
    const driversWithDistance = availableDrivers
      .map((driver) => ({
        ...driver,
        distance: FareService.calculateDistance(
          ride.pickupLat,
          ride.pickupLng,
          driver.currentLat!,
          driver.currentLng!
        ),
      }))
      .sort((a, b) => a.distance - b.distance);

    // Pick nearest driver
    const nearestDriver = driversWithDistance[0];

    // Assign driver
    const updatedRide = await prisma.ride.update({
      where: { id: rideId },
      data: {
        driverId: nearestDriver.id,
        status: 'MATCHED',
        matchedAt: new Date(),
      },
      include: {
        driver: {
          include: {
            user: { select: { name: true, phone: true, avatarUrl: true } },
            vehicle: true,
          },
        },
      },
    });

    // Update driver status
    await prisma.driver.update({
      where: { id: nearestDriver.id },
      data: { status: 'ON_RIDE' },
    });

    return updatedRide;
  }

  /**
   * Update ride status (driver actions).
   */
  static async updateStatus(rideId: string, status: RideStatus, driverId?: string) {
    const ride = await prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) throw new AppError('Ride not found', 404, 'RIDE_NOT_FOUND');

    const updateData: Record<string, unknown> = { status };

    switch (status) {
      case 'DRIVER_ARRIVING':
        updateData.driverArrivedAt = null;
        break;
      case 'IN_PROGRESS':
        updateData.startedAt = new Date();
        break;
      case 'COMPLETED':
        updateData.completedAt = new Date();
        updateData.actualFare = ride.estimatedFare; // Fixed fare = estimated fare
        updateData.paymentStatus = 'COMPLETED';

        // Release driver
        if (ride.driverId) {
          await prisma.driver.update({
            where: { id: ride.driverId },
            data: { status: 'ONLINE', totalRides: { increment: 1 } },
          });
        }

        // Debit rider wallet if paying by wallet
        if (ride.paymentMethod === 'WALLET') {
          await WalletService.debit(
            ride.riderId,
            ride.estimatedFare,
            'RIDE_PAYMENT',
            `Ride ${ride.shortCode} payment`,
            rideId
          );
        }
        break;
    }

    return prisma.ride.update({
      where: { id: rideId },
      data: updateData,
      include: {
        driver: {
          include: {
            user: { select: { name: true, phone: true } },
            vehicle: true,
          },
        },
      },
    });
  }

  /**
   * Get ride by ID with full details.
   */
  static async getRideById(rideId: string) {
    return prisma.ride.findUnique({
      where: { id: rideId },
      include: {
        rider: { select: { id: true, name: true, phone: true, avatarUrl: true } },
        driver: {
          include: {
            user: { select: { id: true, name: true, phone: true, avatarUrl: true } },
            vehicle: true,
          },
        },
        ratings: true,
      },
    });
  }

  /**
   * Get ride history for a user.
   */
  static async getRideHistory(userId: string, page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize;

    const [rides, total] = await Promise.all([
      prisma.ride.findMany({
        where: { riderId: userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          driver: {
            include: {
              user: { select: { name: true, phone: true } },
              vehicle: { select: { type: true, plateNumber: true, color: true } },
            },
          },
        },
      }),
      prisma.ride.count({ where: { riderId: userId } }),
    ]);

    return {
      rides,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}
