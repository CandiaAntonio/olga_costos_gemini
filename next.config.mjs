/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "optim.tildacdn.com",
      },
    ],
  },
};

export default nextConfig;
