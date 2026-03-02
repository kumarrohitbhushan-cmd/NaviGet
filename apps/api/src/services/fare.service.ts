// =====================================================
// FARE SERVICE — The heart of NaviGet's USP
// =====================================================
// RULES (IMMUTABLE):
// 1. Fare = baseFare + (distanceKm × perKmRate). PERIOD.
// 2. No surge multiplier. EVER. Not at 2AM, not on New Year's Eve.
// 3. No time-of-day modifier.
// 4. No location-based modifier (same fare from airport or slum).
// 5. Shared ride = 40% discount with ₹399 minimum.
// =====================================================

import { PrismaClient, VehicleType } from '@prisma/client';
import { SHARED_RIDE_DISCOUNT_PCT, SHARED_RIDE_MIN_FARE, SURGE_MULTIPLIER } from '@fixedride/shared';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export interface FareCalculation {
  vehicleType: VehicleType;
  baseFare: number;
  distanceKm: number;
  perKmRate: number;
  estimatedFare: number;
  isShared: boolean;
  // Explicitly documenting: no surge field exists
}

export class FareService {
  /**
   * Calculate fixed fare for a ride.
   * THIS FUNCTION MUST NEVER INCLUDE SURGE LOGIC.
   */
  static async calculateFare(
    distanceKm: number,
    vehicleType: VehicleType,
    isShared: boolean = false
  ): Promise<FareCalculation> {
    const fareMatrix = await prisma.fareMatrix.findUnique({
      where: { vehicleType },
    });

    if (!fareMatrix) {
      throw new AppError(`Fare not configured for ${vehicleType}`, 400, 'FARE_NOT_FOUND');
    }

    // FIXED FARE FORMULA — No surge, no time modifier, no location modifier
    let fare = fareMatrix.baseFare + distanceKm * fareMatrix.perKmRate;

    // Apply minimum fare
    fare = Math.max(fare, fareMatrix.minimumFare);

    // ASSERT: surge multiplier is always 1.0
    // This line exists as a safeguard. If someone tries to add surge,
    // this assertion documents the intent.
    fare = fare * SURGE_MULTIPLIER; // Always 1.0

    // Shared ride discount
    if (isShared) {
      fare = fare * (1 - SHARED_RIDE_DISCOUNT_PCT);
      fare = Math.max(fare, SHARED_RIDE_MIN_FARE); // Min ₹399 for shared
    }

    // Round to nearest rupee
    fare = Math.round(fare);

    return {
      vehicleType,
      baseFare: fareMatrix.baseFare,
      distanceKm,
      perKmRate: fareMatrix.perKmRate,
      estimatedFare: fare,
      isShared,
    };
  }

  /**
   * Get fare estimates for ALL vehicle types for a given distance.
   */
  static async getAllFareEstimates(
    distanceKm: number,
    isShared: boolean = false
  ): Promise<FareCalculation[]> {
    const vehicleTypes: VehicleType[] = ['AUTO', 'BIKE', 'MINI', 'SEDAN', 'SUV'];
    const estimates = await Promise.all(
      vehicleTypes.map((type) => this.calculateFare(distanceKm, type, isShared))
    );
    return estimates;
  }

  /**
   * Calculate distance between two coordinates using Haversine formula.
   * For production, use Google Maps Distance Matrix API for road distance.
   */
  static calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    // Road distance is typically 1.3x straight-line distance
    return Math.round(distance * 1.3 * 10) / 10;
  }

  private static toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
