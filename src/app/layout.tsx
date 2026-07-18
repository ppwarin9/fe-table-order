import { IBM_Plex_Sans_Thai } from 'next/font/google';
import './globals.css';

const plexThai = IBM_Plex_Sans_Thai({
  variable: '--font-plex-thai',
  weight: ['400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={`${plexThai.variable} h-full antialiased`}>
      <body className={`${plexThai.className} min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
