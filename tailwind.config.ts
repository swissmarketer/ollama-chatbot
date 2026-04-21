import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0f0f1a',
          800: '#1a1a2e',
          700: '#16213e',
          600: '#0f3460',
        },
        accent: {
          500: '#00d4ff',
          400: '#00b8e6',
          600: '#0099cc',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'typing': 'typing 1.4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 212, 255, 0.6)' },
        },
        typing: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glow-accent': '0 0 30px rgba(0, 212, 255, 0.4)',
      },
    },
  },
  plugins: [],
}
export default config