import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export', // REQUIRED for Capacitor - generates static site in out/ folder
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // REQUIRED for static export
  },
};

export default nextConfig;
