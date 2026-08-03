'use client';

// Only fires if the root layout itself throws — must render its own <html>/<body>
// since it replaces the whole page, including Providers/fonts from layout.tsx.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="th">
      <body>
        <div style={{ display: 'flex', minHeight: '100dvh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '1.5rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <div style={{ fontSize: '2.5rem' }}>😵</div>
          <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>เกิดข้อผิดพลาดร้ายแรง</p>
          <button
            onClick={reset}
            style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', background: '#000', color: '#fff', fontSize: '0.875rem' }}
          >
            ลองใหม่
          </button>
        </div>
      </body>
    </html>
  );
}
