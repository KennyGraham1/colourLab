/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // ESLint is optional for this project; never block builds on it.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
