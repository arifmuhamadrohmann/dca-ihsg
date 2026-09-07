import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          success: '#1D9E75',
          'success-bg': '#EAF3DE',
          'success-border': '#C0DD97',
          'success-text': '#173404',
          'success-label': '#3B6D11',
          danger: '#E24B4A',
          'danger-text': '#A32D2D',
          'danger-bg': '#FDECEA',
        },
        page: '#FAFAF7',
        card: '#FFFFFF',
        soft: '#F1EFE8',
      },
    },
  },
  plugins: [],
};

export default config;
