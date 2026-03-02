import type { Metadata, Viewport } from 'next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NaviGet — Fixed Fare Rides, No Surge, Ever.',
  description:
    'India\'s smartest ride-hailing platform. Fixed fares 24×7, zero surge pricing, ₹0 cancellation, 2× refund if we cancel your ride.',
  keywords: ['cab booking', 'fixed fare', 'no surge', 'ride hailing', 'NaviGet', 'navigate'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FFFFFF',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="max-w-lg mx-auto relative min-h-[100dvh]">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
