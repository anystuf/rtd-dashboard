/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
  reactStrictMode: true,
  output: process.env.NEXT_EXPORT === 'true' ? 'export' : undefined,
  images: { unoptimized: true },
  trailingSlash: isGithubPages,
  basePath: isGithubPages ? '/rtd-dashboard' : undefined,
  assetPrefix: isGithubPages ? '/rtd-dashboard/' : undefined
};

export default nextConfig;
