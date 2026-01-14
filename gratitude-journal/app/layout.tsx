import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { PostHogProvider } from '@/lib/posthog';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Gratitude Journal',
  description: 'Celebrate what is good in your life, one moment at a time. Feel seen, celebrated, and uplifted as you recognize the beauty around you.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
