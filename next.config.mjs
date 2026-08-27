/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.r2.dev' },
      { protocol: 'https', hostname: 'images.qonys.kz' }
    ]
  },
  experimental: { serverActions: { bodySizeLimit: '8mb' } }
};
export default nextConfig;
