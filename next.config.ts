import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ph-files.imgix.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
