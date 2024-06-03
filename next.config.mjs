/** @type {import("next").NextConfig} */
const nextConfig = {
   async redirects() {
      return [
         {
            source: "/",
            destination: "/login",
            permanent: true,
         },
      ]
   },
   reactStrictMode: true,
   reactProductionProfiling: false,
   eslint: {
      ignoreDuringBuilds: false, // Set to true if build errors occur
   },
   images: {
      loader: "custom",
      loaderFile: "./src/common/util/backendImageLoader.util.ts",
   },
}

export default nextConfig
