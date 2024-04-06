/** @type {import('next').NextConfig} */
module.exports = {
  basePath: process.env.NODE_ENV === 'production' ? '/gloria-devlog' : '',
  // enable static export
  output: 'export',
  transpilePackages: ['@repo/ui'],
};
