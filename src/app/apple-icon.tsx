import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #070D14 0%, #0c1c2e 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 36,
          border: '4px solid #38bdf8',
          boxShadow: '0 0 30px rgba(56, 189, 248, 0.4)',
        }}
      >
        <svg
          width="100"
          height="100"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="#38bdf8" fill="#0369a1" />
          <polyline points="9 22 9 12 15 12 15 22" stroke="#f59e0b" fill="#f59e0b" />
          <line x1="12" y1="2" x2="12" y2="6" stroke="#38bdf8" />
        </svg>
        <span
          style={{
            marginTop: 6,
            fontSize: 16,
            fontWeight: 800,
            color: '#f59e0b',
            letterSpacing: 2,
            fontFamily: 'sans-serif',
          }}
        >
          HOSTEL-PRO
        </span>
      </div>
    ),
    {
      ...size,
    }
  );
}
