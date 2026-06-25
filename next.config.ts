import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Convex file storage serves menu item images from the deployment domain.
      { protocol: "https", hostname: "*.convex.cloud" },
    ],
  },
};

export default nextConfig;
