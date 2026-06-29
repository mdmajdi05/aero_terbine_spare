import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | Aero Turbine Spare',
  description: 'Read the latest articles on aerospace parts, aviation industry insights, maintenance tips, and procurement guides from AeroTurbineSpare.',
  openGraph: {
    title: 'Blog | Aero Turbine Spare',
    description: 'Read the latest articles on aerospace parts, aviation industry insights, maintenance tips, and procurement guides from AeroTurbineSpare.',
    type: 'website',
    url: 'https://aeroturbinespare.com/blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Aero Turbine Spare',
    description: 'Read the latest articles on aerospace parts, aviation industry insights, maintenance tips, and procurement guides from AeroTurbineSpare.',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
