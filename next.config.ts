import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "www.echosmedias.net" },
      { protocol: "https", hostname: "cdnx.premiumread.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "www.fratmat.info" },
      { protocol: "https", hostname: "www.koaci.com" },
      { protocol: "https", hostname: "akwabavision.com" },
    ],
  },
};

export default nextConfig;