// NaviGet — Shared Constants
// These constants enforce business rules across ALL layers

export const APP_NAME = 'NaviGet';
export const APP_VERSION = '1.0.0';

// ======================== USP CONSTANTS ========================

/** Surge multiplier is ALWAYS 1. This is a core USP. NEVER change. */
export const SURGE_MULTIPLIER = 1.0;

/** Refund multiplier when platform/driver cancels a ride */
export const PLATFORM_CANCEL_REFUND_MULTIPLIER = 2;

/** Rider cancellation fee — ALWAYS zero. Core USP. */
export const RIDER_CANCELLATION_FEE = 0;

/** Minimum fare for shared rides (₹) */
export const SHARED_RIDE_MIN_FARE = 399;

/** Shared ride discount percentage */
export const SHARED_RIDE_DISCOUNT_PCT = 0.4; // 40% discount

/** Maximum riders in a shared ride */
export const SHARED_RIDE_MAX_RIDERS = 3;

/** Maximum route deviation for shared rides (%) */
export const SHARED_RIDE_MAX_DEVIATION_PCT = 20;

/** Maximum advance scheduling time (hours) */
export const MAX_SCHEDULE_ADVANCE_HOURS = 2;

/** Driver pre-assignment time before scheduled pickup (minutes) */
export const DRIVER_PRE_ASSIGN_MINUTES = 15;

// ======================== AUTH CONSTANTS ========================

export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MINUTES = 5;
export const OTP_MAX_ATTEMPTS = 3;
export const OTP_RATE_LIMIT_PER_HOUR = 5;
export const JWT_ACCESS_EXPIRY = '15m';
export const JWT_REFRESH_EXPIRY = '7d';

// ======================== RIDE CONSTANTS ========================

/** Time to wait for driver to accept (seconds) */
export const RIDE_REQUEST_TIMEOUT_SEC = 30;

/** Search radius for nearby drivers (km) */
export const DRIVER_SEARCH_RADIUS_KM = 5;

/** Maximum search radius expansion (km) */
export const MAX_SEARCH_RADIUS_KM = 15;

/** Ride OTP digits for verification at pickup */
export const RIDE_OTP_LENGTH = 4;

// ======================== DRIVER CONSTANTS ========================

/** Location update interval (seconds) */
export const DRIVER_LOCATION_UPDATE_INTERVAL_SEC = 5;

/** Consider driver stale if no update in (seconds) */
export const DRIVER_STALE_THRESHOLD_SEC = 60;

// ======================== PAGINATION ========================

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
