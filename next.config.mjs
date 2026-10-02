/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["127.0.0.1"],
  images: { unoptimized: true },
  turbopack: { root: process.cwd() },
};

export default nextConfig;
