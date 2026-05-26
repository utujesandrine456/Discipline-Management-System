import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'https://discipline-management-system-rgr8.onrender.com';
    return [
      {
        source: '/api-proxy/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
