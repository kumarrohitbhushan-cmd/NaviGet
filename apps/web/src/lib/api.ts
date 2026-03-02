const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

interface FetchOptions extends RequestInit {
  token?: string;
}

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOpts } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOpts,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || 'Something went wrong');
  }

  return data;
}

// ======================== AUTH API ========================

export const authAPI = {
  sendOtp: (phone: string) =>
    fetchAPI('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),

  verifyOtp: (phone: string, code: string) =>
    fetchAPI<{
      success: boolean;
      data: {
        accessToken: string;
        refreshToken: string;
        user: { id: string; phone: string; name?: string; role: string; isNewUser: boolean };
      };
    }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    }),

  refresh: (refreshToken: string) =>
    fetchAPI<{ success: boolean; data: { accessToken: string } }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
};

// ======================== RIDER API ========================

export const riderAPI = {
  getFareEstimate: (
    pickup: { lat: number; lng: number },
    drop: { lat: number; lng: number },
    vehicleType: string,
    token: string
  ) =>
    fetchAPI(
      `/rider/fare-estimate?pickup[lat]=${pickup.lat}&pickup[lng]=${pickup.lng}&drop[lat]=${drop.lat}&drop[lng]=${drop.lng}&vehicleType=${vehicleType}`,
      { token }
    ),

  bookRide: (
    data: {
      pickup: { lat: number; lng: number; address: string };
      drop: { lat: number; lng: number; address: string };
      vehicleType: string;
      paymentMethod: string;
      isShared?: boolean;
      isScheduled?: boolean;
      scheduledAt?: string;
    },
    token: string
  ) =>
    fetchAPI('/rider/book', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  cancelRide: (rideId: string, token: string) =>
    fetchAPI(`/rider/cancel/${rideId}`, { method: 'POST', token }),

  getRides: (page: number, token: string) =>
    fetchAPI(`/rider/rides?page=${page}`, { token }),

  getRide: (rideId: string, token: string) =>
    fetchAPI(`/rider/ride/${rideId}`, { token }),

  rateRide: (rideId: string, stars: number, comment: string, token: string) =>
    fetchAPI(`/rider/rate/${rideId}`, {
      method: 'POST',
      body: JSON.stringify({ stars, comment }),
      token,
    }),
};

// ======================== WALLET API ========================

export const walletAPI = {
  getBalance: (token: string) =>
    fetchAPI('/wallet/balance', { token }),

  getTransactions: (page: number, token: string) =>
    fetchAPI(`/wallet/transactions?page=${page}`, { token }),

  topUp: (amount: number, paymentMethod: string, token: string) =>
    fetchAPI('/wallet/topup', {
      method: 'POST',
      body: JSON.stringify({ amount, paymentMethod }),
      token,
    }),
};

export default fetchAPI;
