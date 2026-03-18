/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow requests to dev assets from any host/network origin.
  allowedDevOrigins: ['172.19.80.1:3000', 'localhost:3000']
};

export default nextConfig;
