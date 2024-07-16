import type { Config } from "tailwindcss"

const config: Config = {
   content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
   theme: {
      fontFamily: { sans: ["Poppins"] },
      extend: {
         backgroundImage: {
            "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
            "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
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
            fb: "rgba(0, 0, 0, 0.15) 0px 5px 15px 0px",
            soft: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
         },
         fontSize: {
            base: "var(--font-base)",
            "sub-base": "var(--font-sub-base)",
         },
         fontFamily: {
            base: "var(--font)",
         },
      },
   },
   important: true,
}
export default config
