import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Duck Tracker',
  description: 'Track your Jeep ducks around the world 🦆',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
