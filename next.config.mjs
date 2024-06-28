/** @type {import("next").NextConfig} */
const nextConfig = {
   async redirects() {
      return [
         {
            source: "/",
            destination: "/login",
            permanent: true,
         },
         {
            source: "/admin",
            destination: "/admin/dashboard",
            permanent: true,
         },
         {
            source: "/head-staff",
            destination: "/head-staff/dashboard",
            permanent: true,
         },
         {
            source: "/head",
            destination: "/head/dashboard",
            permanent: true,
         },
         {
            source: "/staff",
            destination: "/staff/dashboard",
            permanent: true
         }
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
