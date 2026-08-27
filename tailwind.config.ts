import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f7f1',
          100: '#e5eee2',
          200: '#c9dcc8',
          500: '#5a9b67',
          600: '#3f8054',
          700: '#2e6543',
          900: '#14261d',
          950: '#0a1510',
        },
        sun: {
          400: '#ffd96a',
          500: '#f4b844',
          600: '#c98b1e',
        },
      },
      boxShadow: {
        soft: '0 22px 60px -24px rgba(2, 44, 22, .28)',
        card: '0 12px 32px -18px rgba(2, 44, 22, .25)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};

export default config;
