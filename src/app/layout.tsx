import type { Metadata } from 'next';
import './globals.css';
import { getGlobalSettings } from '@/app/actions';

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let settings = { ghl_script: '', analytics_script: '', custom_css: '' };
  try {
    settings = await getGlobalSettings();
  } catch {
    /* Silent fail — portal_settings table may not be seeded yet */
  }

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* GEO: Analytics Script (Google Analytics, Facebook Pixel, etc.) */}
        {settings.analytics_script && (
          <div dangerouslySetInnerHTML={{ __html: settings.analytics_script }} />
        )}
        {/* GEO: Custom CSS overrides */}
        {settings.custom_css && (
          <style dangerouslySetInnerHTML={{ __html: settings.custom_css }} />
        )}
      </head>
      <body>
        {children}
        {/* GEO: Go High Level chat widget / tracking script */}
        {settings.ghl_script && (
          <div dangerouslySetInnerHTML={{ __html: settings.ghl_script }} />
        )}
      </body>
    </html>
  );
}
