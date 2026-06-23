import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://aeroturbinespare.com'),
  title: {
    default: 'AeroTurbineSpare — Precision Aerospace Parts Sourcing',
    template: '%s | AeroTurbineSpare',
  },
  description:
    'Source certified aerospace parts fast. NSN, CAGE, turbine components, MRO supplies. ISO-certified, 100% inspection, 24-hour quotes. Trusted by OEMs & MRO facilities worldwide.',
  keywords: [
    'aerospace parts', 'NSN parts', 'CAGE code', 'turbine components',
    'MRO supplies', 'aircraft parts', 'aerospace procurement',
    'military parts', 'gas turbine', 'jet engine parts',
  ],
  authors: [{ name: 'AeroTurbineSpare' }],
  openGraph: {
    type: 'website',
    siteName: 'AeroTurbineSpare',
    title: 'AeroTurbineSpare — Precision Aerospace Parts Sourcing',
    description: 'Fast, certified aerospace parts sourcing. ISO 9001, AS9120 certified. 100% inspection on every order.',
    url: 'https://aeroturbinespare.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AeroTurbineSpare',
    description: 'Precision Aerospace Parts Sourcing — Fast, Certified, Global',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0A1628',
              color: '#E8EDF2',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#00A651', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#E8751A', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  );
}
