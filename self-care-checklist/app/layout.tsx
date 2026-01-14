import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { PostHogProvider } from '@/lib/posthog';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Self-Care Checklist',
  description: 'Feel PROUD, CELEBRATED, and WORTHY for taking care of themselves. Each checked item should feel like a small victory, with the AI acting as a supportive friend',
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
