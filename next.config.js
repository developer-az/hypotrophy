/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Lint is a dedicated `npm run lint` / CI concern. next lint without a
    // config file is interactive on Next 15.5 and fails non-TTY Vercel builds.
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
