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
            source: "/head-staff/desktop",
            destination: "/head-staff/desktop/dashboard",
            permanent: true,
         },
         {
            source: "/head-staff/mobile",
            destination: "/head-staff/mobile/dashboard",
            permanent: true,
         },
         {
            source: "/staff",
            destination: "/staff/dashboard",
            permanent: true,
         },
         {
            source: "/stockkeeper/mobile",
            destination: "/stockkeeper/mobile/dashboard",
            permanent: true,
         },
         {
            source: "/stockkeeper/desktop",
            destination: "/stockkeeper/desktop/dashboard",
            permanent: true,
         },
      ]
   },
   reactStrictMode: true,
   reactProductionProfiling: false,
   eslint: {
      ignoreDuringBuilds: false, // Set to true if build errors occur
   },
   // images: {
   //    loader: "custom",
   //    loaderFile: "./src/common/util/backendImageLoader.util.ts",
   // },
   i18n: {
      locales: ["vie", "eng"],
      defaultLocale: "vie",
   },
}

export default nextConfig
