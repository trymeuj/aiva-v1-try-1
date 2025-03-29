/** @type {import('next').NextConfig} */

// next.config.ts
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8001/api/:path*', // Use 127.0.0.1 instead of localhost
      },
      {
        source: '/mcp/:tool',
        destination: 'http://127.0.0.1:8000/tools/:tool', // MCP tools
      },
      {
        source: '/api/you/:path*',
        destination: 'http://127.0.0.1:8001/api/you/:path*', // You.com API endpoints
      },
    ];
  },
};

module.exports = nextConfig;