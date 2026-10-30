import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paypal: {
          blue: "#0070BA",
          darkblue: "#003087",
          navy: "#001C6A",
          yellow: "#FFC439",
          gold: "#F2BA36",
          gray: "#F5F7FA"
        }
      }
    },
  },
  plugins: [],
};
export default config;
