import withBundleAnalyzer from "@next/bundle-analyzer"

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
   reactStrictMode: false,
   reactProductionProfiling: false,
   eslint: {
      ignoreDuringBuilds: false,
   },
   typescript: {
      ignoreBuildErrors: false,
   },
   i18n: {
      locales: ["vie", "eng"],
      defaultLocale: "vie",
   },
}

export default withBundleAnalyzer({ enabled: false })(nextConfig)
