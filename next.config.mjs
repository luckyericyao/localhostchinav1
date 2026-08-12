/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
