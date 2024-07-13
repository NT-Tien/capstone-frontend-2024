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
            source: "/head",
            destination: "/head/dashboard",
            permanent: true,
         },
         {
            source: "/staff",
            destination: "/staff/dashboard",
            permanent: true,
         },
         {
            source: "/stockkeeper",
            destination: "/stockkeeper/dashboard",
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
   i18n: {
      locales: ["vie", "eng"],
      defaultLocale: "vie",
   },
}

export default nextConfig
