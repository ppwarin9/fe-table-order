import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Hides the `X-Powered-By: Next.js` response header (minor info-disclosure hardening).
  poweredByHeader: false,

  async headers() {
    return [
      {
        // Applies to every route — static security headers, safe defaults for both the
        // customer LIFF pages and the admin dashboard.
        source: '/:path*',
        headers: [
          // Prevents this app from being framed by another site (clickjacking).
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Stops the browser from MIME-sniffing a response away from its declared type.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Never leak the full referrer URL (which can contain sessionToken-bearing
          // query strings, e.g. /join?t=...) to a different origin.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Disables browser features this app never needs.
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
