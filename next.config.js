/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8001/api/:path*',
      },
      {
        source: '/workflow/:path*',
        destination: 'http://localhost:8001/workflow/:path*',
      },
      {
        source: '/orchestrator/:path*',
        destination: 'http://localhost:8001/orchestrator/:path*',
      },
      {
        source: '/extract',
        destination: 'http://localhost:8001/extract',
      }
    ];
  },
};

module.exports = nextConfig; 