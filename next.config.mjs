/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    const revision = process.env.VERCEL_GIT_COMMIT_SHA;
    if (revision?.length !== 40 || /[^a-f0-9]/.test(revision)) return [];

    return [{
      source: "/:path*",
      headers: [{ key: "X-Localhost-Revision", value: revision }]
    }];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "localhostchinav1.vercel.app"
          }
        ],
        destination: "https://localhostglobal.vercel.app/:path*",
        permanent: true
      }
    ];
  }
};

export default nextConfig;
