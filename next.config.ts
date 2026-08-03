import type { NextConfig } from 'next';

// Deliberately permissive on script-src/connect-src (no nonce infrastructure exists to
// support a strict script-src without risking breaking Next.js/socket.io/axios in
// production with no way to live-test the fix). The parts that matter for this app's
// actual risk profile — admin-entered menu-image URLs (see MenuForm's imageUrl field)
// and the LINE LIFF SDK's iframe usage — are meaningfully restricted: object-src and
// base-uri are locked down, and frame-src only allows LINE's own domains.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https: data:",
  "font-src 'self' data:",
  "connect-src 'self' https: wss: ws:",
  "frame-src 'self' https://liff.line.me https://access.line.me",
  "object-src 'none'",
  "base-uri 'self'",
].join('; ');

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
          { key: 'Content-Security-Policy', value: CSP },
        ],
      },
    ];
  },
};

export default nextConfig;
