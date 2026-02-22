/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  eslint: {
    ignoreDuringBuilds: false,
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
}

export default nextConfig
