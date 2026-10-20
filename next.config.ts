import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    // ~10 kB gzipped: cheaper inline than as a render-blocking request on a slow connection.
    inlineCss: true,
  },
  images: {
    // Next's defaults plus 336: posters are `sizes="110px"`, so a 3x phone asks for 330 and would get 384.
    imageSizes: [32, 48, 64, 96, 128, 256, 336, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
      },
    ],
  },
};

export default nextConfig;
