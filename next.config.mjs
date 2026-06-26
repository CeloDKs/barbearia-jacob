/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Restrinja os hostnames em produção (ex.: bucket/CDN do upload).
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
