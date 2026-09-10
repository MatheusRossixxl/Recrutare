/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: '10mb' },
    serverComponentsExternalPackages: [
      "@prisma/client",
      ".prisma/client",
      "@prisma/adapter-neon",
      "@neondatabase/serverless",
    ],
  },
};
export default nextConfig;
