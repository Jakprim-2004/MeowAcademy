/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode
  reactStrictMode: true,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'iiimpsfjzcgxcoxvveis.supabase.co',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Standalone output for Docker/Vercel
  output: 'standalone',

  // Disable TypeScript errors during build (for migration)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
