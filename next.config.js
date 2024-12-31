/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/Json-formatter',
  // 如果要部署到GitHub Pages，还需要添加
  assetPrefix: '/Json-formatter',
  output: "export",
  distDir: "docs",
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ["@monaco-editor/react"],
  webpack: (config) => {
    config.optimization.minimize = true;
    return config;
  },
};

module.exports = nextConfig;
