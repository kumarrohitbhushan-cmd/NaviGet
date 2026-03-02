import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDistance(km: number): string {
  return `${km.toFixed(1)} km`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hrs}h ${mins}m`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    REQUESTED: 'badge-yellow',
    MATCHED: 'badge-blue',
    DRIVER_ARRIVING: 'badge-blue',
    IN_PROGRESS: 'badge-green',
    COMPLETED: 'badge-green',
    CANCELLED: 'badge-red',
  };
  return colors[status] || 'badge-yellow';
}

export function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    REQUESTED: 'Finding driver...',
    MATCHED: 'Driver assigned',
    DRIVER_ARRIVING: 'Driver arriving',
    IN_PROGRESS: 'Ride in progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  };
  return texts[status] || status;
}
