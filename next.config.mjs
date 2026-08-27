/** @type {import('next').NextConfig} */
const isDevelopment = process.env.NODE_ENV === 'development';

const nextConfig = {
  // Keep development and production artifacts isolated to avoid stale 404s.
  distDir: isDevelopment ? '.next-dev' : '.next',
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
  },
};

export default nextConfig;
