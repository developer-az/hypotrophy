/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Lint is a dedicated `npm run lint` / CI concern. next lint without a
    // config file is interactive on Next 15.5 and fails non-TTY Vercel builds.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Tests live outside this graph (see tsconfig exclude). Fail the
    // production compile on any remaining type error instead of shipping it.
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig
