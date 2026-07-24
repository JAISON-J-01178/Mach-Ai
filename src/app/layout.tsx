import type { Metadata } from 'next';
import { Baloo_2, Noto_Sans_Tamil, Outfit } from 'next/font/google';
import './globals.css';

const baloo = Baloo_2({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-baloo'
});

const notoTamil = Noto_Sans_Tamil({
  subsets: ['tamil', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-tamil'
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-outfit'
});

export const metadata: Metadata = {
  title: 'மச்சி AI - Machi AI',
  description: 'Ultra-fast Tamil & English AI Assistant',
  icons: {
    icon: '/favicon.ico'
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ta" className={`${baloo.variable} ${notoTamil.variable} ${outfit.variable} dark`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-slate-950 text-slate-100 font-sans antialiased selection:bg-purple-500 selection:text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
