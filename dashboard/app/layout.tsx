import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@/src/index.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Vendor Dashboard - SSC Marketplace',
  description: 'Purple Soul Collective dashboard',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
