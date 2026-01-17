import pkg from './package.json' with { type: 'json' };

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        hostname: 's2.googleusercontent.com',
      },
      // 🛡️ Image Proxy: AliExpress product images
      {
        protocol: 'https',
        hostname: 'ae01.alicdn.com',
      },
      {
        protocol: 'https',
        hostname: 'cbu01.alicdn.com',
      },
      {
        protocol: 'https',
        hostname: '**.alicdn.com', // Wildcard for all AliExpress CDN subdomains
      },
      // CJ Dropshipping images
      {
        protocol: 'https',
        hostname: '**.cjdropshipping.com',
      },
      // Google Shopping images (SerpApi)
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
    ],
  },
  serverExternalPackages: ['pdf-parse', 'chromadb'],
  webpack: (config, { isServer, webpack }) => {
    if (isServer) {
      // Ignore external URL imports from ChromaDB - this is the key fix
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^https:\/\/unpkg\.com\/chromadb-default-embed/,
        }),
        // Also ignore any dynamic imports that try to load from unpkg
        new webpack.IgnorePlugin({
          checkResource(resource, context) {
            if (resource && resource.includes('unpkg.com/chromadb')) {
              return true;
            }
            return false;
          },
        })
      );
    }
    
    return config;
  },
  outputFileTracingIncludes: {
    '/api/**': [
      './node_modules/@napi-rs/canvas/**',
      './node_modules/@napi-rs/canvas-linux-x64-gnu/**',
      './node_modules/@napi-rs/canvas-linux-x64-musl/**',
    ],
  },
  env: {
    NEXT_PUBLIC_VERSION: pkg.version,
  },
};

export default nextConfig;
