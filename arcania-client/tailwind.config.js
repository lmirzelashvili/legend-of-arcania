/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark Fantasy Palette
        void: '#0a0a0f',
        abyss: '#12121a',
        shadow: '#1a1a27',
        nightfall: '#242435',
        twilight: '#2d2d42',

        // Blood & Fire
        blood: '#8b0000',
        crimson: '#dc143c',
        ember: '#ff4500',

        // Gold & Wealth
        gold: '#ffd700',
        amber: '#ffbf00',

        // Arcane & Mystic
        arcane: '#4a0e78',
        mystic: '#6a0dad',
        ethereal: '#9370db',
        soul: '#00ffff',
        frost: '#87ceeb',

        // Original Arcania Colors
        arcania: {
          dark: '#0f0f1e',
          darker: '#080812',
          gold: '#fbbf24',
          silver: '#e5e7eb',
          blue: '#3b82f6',
          purple: '#a855f7',
        },
      },
      fontFamily: {
        medieval: ['Cinzel', 'serif'],
        pixel: ['Press Start 2P', 'monospace'],
        fantasy: ['MedievalSharp', 'cursive'],
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'shimmer': 'shimmerGold 3s ease-in-out infinite',
        'glitch': 'glitch 0.3s ease-in-out',
        'scan': 'progressScan 1s linear infinite',
      },
      boxShadow: {
        'arcane': '0 8px 32px rgba(106, 13, 173, 0.4)',
        'blood': '0 8px 32px rgba(220, 20, 60, 0.4)',
        'gold': '0 0 20px rgba(255, 215, 0, 0.5)',
        'deep': '0 16px 48px rgba(0, 0, 0, 0.8)',
      },
    },
  },
  plugins: [],
}
