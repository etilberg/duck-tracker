import type { Metadata } from 'next';
import './globals.css';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'QuackerTracks',
  description: 'Track your Jeep ducks around the world 🦆',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
