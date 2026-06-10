import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [/middleware-manifest\.json$/, /_next\/static\/media\//],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",           // Important for Vercel
  swcMinify: true,
  // Optional: Reduce memory usage on Vercel
  experimental: {
    optimizePackageImports: ["react", "react-dom"],
  },
};

export default withPWA(nextConfig);