import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Snewroof — Customer Portal',
  description: 'Book inspections, track projects, manage quotes and invoices with Snewroof.',
  keywords: 'roofing, inspection, quote, project tracking, customer portal',
  openGraph: {
    title: 'Snewroof Customer Portal',
    description: 'Your premium roofing services management portal.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
