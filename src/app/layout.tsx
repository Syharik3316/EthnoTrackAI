import type {Metadata} from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Global Toaster

const geistSans = GeistSans; // Updated to use direct import
const geistMono = GeistMono; // Updated to use direct import

export const metadata: Metadata = {
  title: 'EthnoTrack AI',
  description: 'Interactive cultural and auto-tourism platform with AI guides.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
