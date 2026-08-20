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
        proofly: {
          bg: '#090D16',
          card: '#0F172A',
          cardBorder: '#1E293B',
          cardHover: '#172554',
          accent: '#3B82F6',
          accentHover: '#2563EB',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#EF4444',
          indigo: '#6366F1',
          cyan: '#06B6D4',
          purple: '#8B5CF6',
          textMuted: '#94A3B8',
          textPrimary: '#F8FAFC',
          textSecondary: '#CBD5E1',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'trace-flow': 'traceFlow 2s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '.75', transform: 'scale(1.02)' },
        },
        traceFlow: {
          '0%': { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' },
        }
      }
    },
  },
  plugins: [],
}
