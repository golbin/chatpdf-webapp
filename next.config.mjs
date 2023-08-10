/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  webpack: (
    config, options
  ) => {
    // Important: return the modified config
    config.module.rules.push({
      test: /\.node/,
      use: 'raw-loader',
    });
    return config;
  },
}

export default nextConfig
