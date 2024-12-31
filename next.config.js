/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ["@monaco-editor/react"],
  webpack: (config) => {
    config.optimization.minimize = true;
    return config;
  },
};

module.exports = nextConfig;
