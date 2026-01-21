/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  transpilePackages: ['@fable-js/parser', '@fable-js/runtime'],
}

export default nextConfig