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
        bg: {
          main: '#0A0A0C',
          surface: '#121216',
          hover: '#1A1A22',
          active: '#22222E',
        },
        border: {
          subtle: '#23232F',
          focus: '#4F46E5',
        },
        text: {
          main: '#F3F4F6',
          muted: '#9CA3AF',
          dim: '#6B7280',
        },
        pillar: {
          authority: '#6366F1',
          offer: '#10B981',
          aradhya: '#8B5CF6',
          proof: '#F59E0B',
        }
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-authority': '0 0 20px -5px rgba(99, 102, 241, 0.3)',
        'glow-offer': '0 0 20px -5px rgba(16, 185, 129, 0.3)',
        'glow-aradhya': '0 0 20px -5px rgba(139, 92, 246, 0.3)',
        'glow-proof': '0 0 20px -5px rgba(245, 158, 11, 0.3)',
      }
    },
  },
  plugins: [],
}
