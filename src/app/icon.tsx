import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 18,
          background: 'linear-gradient(135deg, #070D14 0%, #0F2236 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          border: '1.5px solid #38bdf8',
          boxShadow: '0 0 10px rgba(56, 189, 248, 0.5)',
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Hostel Building & Shield Emblem */}
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="#38bdf8" fill="#0c4a6e" />
          <polyline points="9 22 9 12 15 12 15 22" stroke="#f59e0b" fill="#f59e0b" />
          <line x1="12" y1="2" x2="12" y2="6" stroke="#38bdf8" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
