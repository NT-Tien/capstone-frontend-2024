import withBundleAnalyzer from "@next/bundle-analyzer"

/** @type {import("next").NextConfig} */
const nextConfig = {
   webpack: (config, { isServer }) => {
      if (isServer) {
         config.externals = config.externals || []
         config.externals.push({
            "localStorage": "localStorage",
            "window": "window",
         })
      }

      return config
   },
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
      ignoreDuringBuilds: true, // Set to true if build errors occur
   },
   typescript: {
      // !! WARN !!
      // Dangerously allow production builds to successfully complete even if
      // your project has type errors.
      // !! WARN !!
      ignoreBuildErrors: false,
   },
   i18n: {
      locales: ["vie", "eng"],
      defaultLocale: "vie",
   },
}

export default withBundleAnalyzer({ enabled: false })(nextConfig)
