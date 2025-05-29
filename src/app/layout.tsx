
import type {Metadata} from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Global Toaster
import { ThemeProvider } from '@/components/theme-provider';

const geistSans = GeistSans; 
const geistMono = GeistMono; 

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
    <html lang="ru" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false} // Set to true if you want system preference detection
          storageKey="ethnotrack-theme"
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
