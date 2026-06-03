/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        destination: "/find",
        permanent: false,
        source: "/challenge"
      },
      {
        destination: "/find?when=today",
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
