// NaviGet — Shared Types
// Type definitions used across API and Web

export type VehicleType = 'AUTO' | 'BIKE' | 'MINI' | 'SEDAN' | 'SUV';

export type RideStatus =
  | 'REQUESTED'
  | 'MATCHED'
  | 'DRIVER_ARRIVING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type CancelledBy = 'RIDER' | 'DRIVER' | 'SYSTEM';

export type UserRole = 'RIDER' | 'DRIVER' | 'ADMIN';

export type DriverStatus = 'OFFLINE' | 'ONLINE' | 'ON_RIDE';

export type TransactionType = 'CREDIT' | 'DEBIT';

export type TransactionReason =
  | 'RIDE_PAYMENT'
  | 'REFUND_2X'
  | 'TOP_UP'
  | 'PROMO'
  | 'SHARED_RIDE_PAYMENT'
  | 'WITHDRAWAL';

export type PaymentMethod = 'WALLET' | 'UPI' | 'CARD' | 'CASH';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

// ======================== API TYPES ========================

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface FareEstimate {
  vehicleType: VehicleType;
  baseFare: number;
  distanceKm: number;
  estimatedFare: number;
  estimatedDurationMin: number;
  // NO surge field. By design.
}

export interface RideRequest {
  pickup: Location;
  drop: Location;
  vehicleType: VehicleType;
  paymentMethod: PaymentMethod;
  isShared?: boolean;
  isScheduled?: boolean;
  scheduledAt?: string; // ISO date
}

export interface RideResponse {
  id: string;
  shortCode: string;
  status: RideStatus;
  vehicleType: VehicleType;
  pickup: Location;
  drop: Location;
  estimatedFare: number;
  actualFare?: number;
  distanceKm?: number;
  durationMin?: number;
  isShared: boolean;
  isScheduled: boolean;
  scheduledAt?: string;
  driver?: DriverInfo;
  rideOtp?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;
  matchedAt?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface DriverInfo {
  id: string;
  name: string;
  phone: string;
  avatarUrl?: string;
  rating: number;
  vehicle: VehicleInfo;
  currentLocation?: Location;
}

export interface VehicleInfo {
  type: VehicleType;
  make: string;
  model: string;
  color: string;
  plateNumber: string;
}

export interface WalletInfo {
  balance: number;
  lastUpdated: string;
}

export interface TransactionInfo {
  id: string;
  type: TransactionType;
  amount: number;
  reason: TransactionReason;
  description?: string;
  rideId?: string;
  balanceAfter: number;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  role: UserRole;
  wallet: WalletInfo;
  totalRides: number;
  memberSince: string;
}

// ======================== SOCKET EVENTS ========================

export interface SocketEvents {
  // Rider events
  'ride:matched': { ride: RideResponse };
  'ride:driver-arriving': { ride: RideResponse; eta: number };
  'ride:driver-arrived': { ride: RideResponse };
  'ride:started': { ride: RideResponse };
  'ride:location': { lat: number; lng: number; heading: number };
  'ride:completed': { ride: RideResponse; fare: number };
  'ride:cancelled': { ride: RideResponse; refundAmount?: number };

  // Driver events
  'ride:request': { ride: RideResponse; timeout: number };
  'ride:cancelled-by-rider': { rideId: string };
  'driver:location-ack': { timestamp: number };
}

// ======================== API RESPONSE WRAPPER ========================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
