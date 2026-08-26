/** @type {import('next').NextConfig} */
const nextConfig = {
  // Bundle the Auth dependency chain for runtimes without Node's require(esm).
  transpilePackages: ["firebase-admin", "jwks-rsa", "jose"],
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
