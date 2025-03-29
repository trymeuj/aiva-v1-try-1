/** @type {import('next').NextConfig} */

// next.config.js (not .ts)
const nextConfig = {
  async rewrites() {
    return [
      // Base API routes
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8001/api/:path*',
      },
      // MCP tools for Docs
      {
        source: '/mcp/:tool',
        destination: 'http://127.0.0.1:8000/tools/:tool',
      },
      // Gmail API endpoints - ensure these come before more general /api routes
      {
        source: '/api/gmail/:action',
        destination: 'http://localhost:4100/api/gmail/:action',
      },
      // Calendar API endpoints
      {
        source: '/api/calendar/:action',
        destination: 'http://localhost:4100/api/calendar/:action',
      },
      // You.com API endpoints
      {
        source: '/api/you/:path*',
        destination: 'http://127.0.0.1:8001/api/you/:path*',
      },
    ];
  },
};

module.exports = nextConfig;