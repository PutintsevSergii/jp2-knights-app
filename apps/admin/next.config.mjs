/** @type {import("next").NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@jp2/shared-design-tokens",
    "@jp2/shared-types",
    "@jp2/shared-validation"
  ]
};

export default nextConfig;
