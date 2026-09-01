/** @type {import('next').NextConfig} */
const isDevelopment = process.env.NODE_ENV === 'development';

const nextConfig = {
  // Keep development and production artifacts isolated to avoid stale 404s.
  distDir: isDevelopment ? '.next-dev' : '.next',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'api.qrserver.com' },
      { protocol: 'https', hostname: 'www.pressafrik.com' },
      { protocol: 'https', hostname: 'image.seneweb.com' },
    ],
  },
};

export default nextConfig;
