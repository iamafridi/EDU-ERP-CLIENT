import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.VERCEL ? undefined : 'standalone',

  /**
   * HTTP cache headers.
   *
   * - Static assets (_next/static) are already fingerprinted and immutable.
   * - API proxy requests get `no-cache` so the browser always hits the
   *   backend (the backend can set its own Cache-Control if needed).
   */
  headers: async () => [
    {
      source: "/api/:path*",
      headers: [
        { key: "Cache-Control", value: "private, no-cache" },
      ],
    },
  ],

  async rewrites() {
    const backendUrl =
      process.env.BACKEND_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") ||
      "http://localhost:5000";
    return [
      {
        source: "/admin/users/:path*",
        destination: "/users/:path*",
      },
      {
        source: "/admin/users",
        destination: "/users",
      },
      {
        source: "/admin/audit/:path*",
        destination: "/audit/:path*",
      },
      {
        source: "/admin/audit",
        destination: "/audit",
      },
      {
        source: "/admin/settings/:path*",
        destination: "/settings/:path*",
      },
      {
        source: "/admin/settings",
        destination: "/settings",
      },
      {
        source: "/admin/switchboard/:path*",
        destination: "/switchboard/:path*",
      },
      {
        source: "/admin/switchboard",
        destination: "/switchboard",
      },
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
