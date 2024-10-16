import type { Config } from "tailwindcss"

const config: Config = {
   content: [
      "./src/app/**/*.{js,ts,jsx,tsx}",
      "./src/components/**/*.{js,ts,jsx,tsx}",
      "./src/common/providers/**/*.{js,ts,jsx,tsx}",
      "./src/components/**/*.{js,ts,jsx,tsx}",
      "./src/common/enum/**/*.{js,ts,jsx,tsx}",
      "./src/features/**/*.{js,ts,jsx,tsx}",
   ],
   theme: {
      fontFamily: { sans: ["Poppins"] },
      extend: {
         backgroundImage: {
            "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
            "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            head_maintenance:
               "radial-gradient(circle at top left, theme('colors.indigo.400'), theme('colors.blue.500'))",
         },
         colors: {
            primary: {
               DEFAULT: "var(--primary-500)",
               50: "var(--primary-50)",
               100: "var(--primary-100)",
               200: "var(--primary-200)",
               300: "var(--primary-300)",
               400: "var(--primary-400)",
               500: "var(--primary-500)",
               600: "var(--primary-600)",
               700: "var(--primary-700)",
               800: "var(--primary-800)",
               900: "var(--primary-900)",
            },
            customLightBlue: "#",
         },
         padding: {
            base: "1rem",
            layout: "var(--std-layout-padding)",
            "layout-half": "calc(var(--std-layout-padding) / 2)",
         },
         margin: {
            layout: "var(--std-layout-padding)",
            "layout-half": "calc(var(--std-layout-padding) / 2)",
         },
         boxShadow: {
            fb: "var(--shadow-fb)",
            soft: "var(--shadow-soft)",
            bottom: "var(--shadow-bottom)",
         },
         fontSize: {
            base: "var(--font-base)",
            "sub-base": "var(--font-sub-base)",
         },
         fontFamily: {
            base: "var(--font)",
         },
         height: {
            navbar: "var(--navbar-height)",
         },
         minHeight: {
            "screen-with-navbar": "calc(100dvh - var(--navbar-height))",
         },
      },
   },
   important: true,
}
export default config
