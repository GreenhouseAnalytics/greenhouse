/** @type {import('next').NextConfig} */
const nextConfig = {
  publicRuntimeConfig: {
    env: {
      MONGODB_URI: process.env.MONGODB_URI,
      NODE_ENV: process.env.NODE_ENV,
    },
  },

  compiler: {
    styledComponents: true,
  },
};

module.exports = nextConfig;
