/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  transpilePackages: ['@fable-js/parser', '@fable-js/runtime'],
  turbopack: {
    rules: {
      '*.node': {
        loaders: [],
        as: '*.js',
      },
    },
  },
  webpack: (config: any) => {
    // Handle Konva canvas dependency for client-side only
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
    };
    return config;
  },
}

export default nextConfig
