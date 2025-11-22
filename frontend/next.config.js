/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
    NEXT_PUBLIC_SOCIAL_BACKEND_URL: process.env.NEXT_PUBLIC_SOCIAL_BACKEND_URL || 'http://localhost:8787',
  },
  images: {
    domains: [],
  },
}

module.exports = nextConfig

