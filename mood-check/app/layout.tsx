import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { PostHogProvider } from '@/lib/posthog';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mood Check',
  description: 'Feel HEARD and VALIDATED when you share how you\'re feeling. Whether you\'re having a great day or a tough one, receive a response that meets you exactly where',
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
