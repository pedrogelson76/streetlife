/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#030305',
          900: '#070709',
          850: '#0b0c10',
          800: '#111217',
          700: '#181a22',
          600: '#222530',
        },
        chrome: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
        },
        metallic: {
          surface: '#0f1015',
          border: '#242733',
          card: '#13141b',
          hover: '#1a1c26',
        },
        gold: {
          champ: '#d4af37',
          glow: '#fbbf24',
        }
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Cinzel', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'chrome-gradient': 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 35%, #64748b 70%, #f8fafc 100%)',
        'chrome-gold': 'linear-gradient(135deg, #fef08a 0%, #d4af37 50%, #996515 100%)',
        'chrome-silver': 'linear-gradient(135deg, #ffffff 0%, #94a3b8 50%, #e2e8f0 100%)',
        'chrome-bronze': 'linear-gradient(135deg, #fed7aa 0%, #c2410c 60%, #7c2d12 100%)',
        'dark-mesh': 'radial-gradient(ellipse at 50% 0%, rgba(56, 189, 248, 0.08) 0%, rgba(3, 3, 5, 0.98) 75%)',
        'metallic-grid': 'linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
      },
      boxShadow: {
        'chrome': '0 0 25px -5px rgba(255, 255, 255, 0.15)',
        'chrome-gold': '0 0 35px -5px rgba(212, 175, 55, 0.25)',
        'cyber': '0 0 20px -3px rgba(56, 189, 248, 0.2)',
      },
      animation: {
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%, 100%': { opacity: '0.85', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
