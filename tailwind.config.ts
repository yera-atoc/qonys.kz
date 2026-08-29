import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FFFFFF',
        subtle: '#F7F8F7',
        card: '#FFFFFF',
        ink: '#0B0B0B',
        muted: '#71767B',
        line: '#E9EAE8',
        mint: { DEFAULT: '#DEF1E4', ink: '#0F6B3F', dot: '#22A06B' },
        danger: { DEFAULT: '#C2453A', soft: '#FBEAE8' },
        gold: { DEFAULT: '#F4C443', soft: '#FDF6E3' },

        // brand и accent использовались в разметке (text-brand, bg-brand-soft,
        // border-accent), но в палитре их не было — Tailwind молча выбрасывал
        // такие классы, и подсветка просто не отрисовывалась. Заводим токены
        // явно поверх уже принятых мятного и золотого.
        brand: { DEFAULT: '#22A06B', soft: '#DEF1E4', ink: '#0F6B3F' },
        accent: { DEFAULT: '#F4C443', soft: '#FDF6E3', ink: '#7A5A08' }
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif']
      },
      borderRadius: { xl: '14px', '2xl': '20px', '3xl': '28px' },
      boxShadow: {
        card: '0 1px 2px rgba(11,11,11,.04), 0 6px 20px -10px rgba(11,11,11,.14)',
        pop: '0 18px 44px -18px rgba(11,11,11,.28)',
        pill: '0 1px 2px rgba(11,11,11,.06)'
      },
      keyframes: {
        rise: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'none' } }
      },
      animation: { rise: 'rise .6s cubic-bezier(.2,.8,.2,1) both' }
    }
  },
  plugins: []
};
export default config;
