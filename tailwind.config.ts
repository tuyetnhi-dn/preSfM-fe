import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
      brand: {
          DEFAULT: "var(--brand)",
          hover: "var(--brand-hover)",
          active: "var(--brand-active)",
          text: "var(--brand-text)",
        },
        bg: {
          base: "var(--bg-base)",
          panel: "var(--bg-panel)",
          hover: "var(--bg-hover)",
        },
        text: {
          base: "var(--text-base)",
          muted: "var(--text-muted)",
        },
        border: {
          base: "var(--border-base)",
          hover: "var(--border-hover)",
        },
      },
      boxShadow: {
        soft: '0 8px 30px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
