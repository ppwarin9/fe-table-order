import { IBM_Plex_Sans_Thai, Geist } from 'next/font/google';
import './globals.css';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const plexThai = IBM_Plex_Sans_Thai({
  variable: '--font-plex-thai',
  weight: ['400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={cn("h-full", "antialiased", plexThai.variable, "font-sans", geist.variable)}>
      <body className={`${plexThai.className} min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
