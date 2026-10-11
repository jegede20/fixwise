import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FixWise — Understand the problem before you pay for it',
  description: 'Safe, practical AI guidance for everyday appliance problems.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
