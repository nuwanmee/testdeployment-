// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;


/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  

  // ... existing config
  images: {
    domains: ['localhost'], // For development
  },
}


module.exports = nextConfig