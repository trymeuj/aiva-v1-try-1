/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*', // Use 127.0.0.1 instead of localhost
      },
    ];
  },
};

module.exports = nextConfig;