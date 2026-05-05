import type { Metadata } from 'next';
import { Space_Grotesk, Public_Sans } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const heading = Space_Grotesk({ subsets: ['latin'], variable: '--font-heading' });
const body = Public_Sans({ subsets: ['latin'], variable: '--font-body' });

export const metadata: Metadata = {
  title: 'PreSfM Web',
  description: 'Smart preprocessing dashboard for OpenSfM pipelines',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${heading.variable} ${body.variable} font-sans text-ink`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
