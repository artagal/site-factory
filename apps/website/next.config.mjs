/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        destination: "/deals?when=tonight",
        permanent: false,
        source: "/challenge"
      },
      {
        destination: "/deals?when=today",
        permanent: false,
        source: "/daily"
      },
      {
        destination: "/deals",
        permanent: false,
        source: "/leaderboard"
      }
    ];
  },
  reactStrictMode: true
};

export default nextConfig;
