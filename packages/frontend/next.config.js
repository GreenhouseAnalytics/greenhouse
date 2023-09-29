const { createVanillaExtractPlugin } = require("@vanilla-extract/next-plugin");
const withVanillaExtract = createVanillaExtractPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  publicRuntimeConfig: {
    env: {
      MONGODB_URI: process.env.MONGODB_URI,
      NODE_ENV: process.env.NODE_ENV,
    },
  },

  experimental: {
    // https://github.com/knex/knex/issues/1128
    serverComponentsExternalPackages: ["knex"],
  },
};

module.exports = withVanillaExtract(nextConfig);
