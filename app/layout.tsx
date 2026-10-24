import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'QuickSave Ghana | Bank of Ghana Tier-3 Digital Microfinance',
  description:
    'West African digital payment ecosystem, daily Susu savings vault, and Bank of Ghana (Act 1052) compliant micro-credit.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'QuickSave GH',
  },
};

export const viewport: Viewport = {
  themeColor: '#022c22',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(console.error);
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#011c15] text-emerald-50 antialiased selection:bg-amber-500/30">
        <div className="mx-auto max-w-md min-h-screen flex flex-col relative shadow-2xl bg-gradient-to-b from-[#022c22] via-[#01241c] to-[#011611] border-x border-emerald-900/30">
          {children}
        </div>
      </body>
    </html>
  );
}
