import { z } from 'zod';

// ======================== AUTH VALIDATORS ========================

export const sendOtpSchema = z.object({
  phone: z
    .string()
    .regex(/^\+91[6-9]\d{9}$/, 'Invalid Indian phone number. Format: +91XXXXXXXXXX'),
});

export const verifyOtpSchema = z.object({
  phone: z.string().regex(/^\+91[6-9]\d{9}$/),
  code: z.string().length(6, 'OTP must be 6 digits'),
});

// ======================== RIDE VALIDATORS ========================

const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  address: z.string().optional(),
});

export const vehicleTypeSchema = z.enum(['AUTO', 'BIKE', 'MINI', 'SEDAN', 'SUV']);

export const fareEstimateSchema = z.object({
  pickup: locationSchema,
  drop: locationSchema,
  vehicleType: vehicleTypeSchema,
});

export const bookRideSchema = z.object({
  pickup: locationSchema.extend({ address: z.string().min(1) }),
  drop: locationSchema.extend({ address: z.string().min(1) }),
  vehicleType: vehicleTypeSchema,
  paymentMethod: z.enum(['WALLET', 'UPI', 'CARD', 'CASH']).default('CASH'),
  isShared: z.boolean().default(false),
  isScheduled: z.boolean().default(false),
  scheduledAt: z
    .string()
    .datetime()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const scheduled = new Date(val);
        const now = new Date();
        const maxAdvance = 2 * 60 * 60 * 1000; // 2 hours
        return scheduled.getTime() > now.getTime() &&
               scheduled.getTime() - now.getTime() <= maxAdvance;
      },
      { message: 'Scheduled time must be within 2 hours from now' }
    ),
});

// ======================== DRIVER VALIDATORS ========================

export const updateLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  heading: z.number().min(0).max(360).optional(),
});

export const driverRegistrationSchema = z.object({
  licenseNumber: z.string().min(5).max(20),
  licenseExpiryDate: z.string().datetime(),
  aadhaarNumber: z.string().length(12).optional(),
  vehicle: z.object({
    type: vehicleTypeSchema,
    make: z.string().min(1).max(50),
    model: z.string().min(1).max(50),
    year: z.number().int().min(2010).max(new Date().getFullYear() + 1),
    color: z.string().min(1).max(30),
    plateNumber: z.string().min(4).max(15),
  }),
});

// ======================== WALLET VALIDATORS ========================

export const topUpSchema = z.object({
  amount: z.number().positive().min(100).max(50000),
  paymentMethod: z.enum(['UPI', 'CARD']),
});

// ======================== PROFILE VALIDATORS ========================

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
});

// ======================== RATING VALIDATOR ========================

export const ratingSchema = z.object({
  stars: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

// ======================== PAGINATION VALIDATOR ========================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

// ======================== ADMIN VALIDATORS ========================

export const updateFareMatrixSchema = z.object({
  vehicleType: vehicleTypeSchema,
  baseFare: z.number().positive(),
  perKmRate: z.number().positive(),
  perMinRate: z.number().nonnegative(),
  minimumFare: z.number().positive(),
  // Explicitly NO surgeMultiplier field — this is intentional
});
