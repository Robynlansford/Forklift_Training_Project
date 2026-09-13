/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        // The scroll-film clips and posters are content-stable — they only change
        // when re-encoded, and a re-encode is always paired with new byteBytes
        // constants in components/scroll-intro.tsx. Cache them hard so a repeat
        // visitor never pays the load-gate wait twice.
        source: "/scroll-intro/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
