/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['@paypal/checkout-server-sdk'],
  },
};

export default nextConfig;
