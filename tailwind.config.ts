import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FAF8F4',
        card: '#FFFFFF',
        ink: '#101C1A',
        muted: '#6B7A75',
        line: '#E4E0D7',
        brand: { DEFAULT: '#0F6B57', ink: '#0A4A3C', soft: '#E7F2EE' },
        accent: { DEFAULT: '#E8A33D', soft: '#FDF3E2' },
        danger: { DEFAULT: '#C2453A', soft: '#FBEAE8' }
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif']
      },
      borderRadius: { xl: '14px', '2xl': '20px', '3xl': '28px' },
      boxShadow: {
        card: '0 1px 2px rgba(16,28,26,.04), 0 8px 24px -12px rgba(16,28,26,.18)',
        pop: '0 12px 40px -16px rgba(16,28,26,.35)'
      },
      keyframes: {
        rise: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'none' } }
      },
      animation: { rise: 'rise .5s cubic-bezier(.2,.8,.2,1) both' }
    }
  },
  plugins: []
};
export default config;
