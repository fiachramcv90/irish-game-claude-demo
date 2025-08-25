/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Irish Learning Game Color Palette
        'irish-green': '#169B62',
        'warm-orange': '#FF8C42',
        'sky-blue': '#4ECDC4',
        'sunset-purple': '#9B59B6',
        'cream-white': '#FFF9E6',
        'soft-gray': '#F5F5F5',
        'dark-gray': '#2C3E50',
        'light-green': '#E8F5E8',
        'bright-yellow': '#F1C40F',
        'coral-pink': '#FF6B9D',
        'mint-green': '#A8E6CF',
      },
      fontFamily: {
        'child-friendly': ['Nunito', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'child-xl': ['1.5rem', { lineHeight: '1.4' }],
        'child-2xl': ['2rem', { lineHeight: '1.3' }],
        'child-3xl': ['2.5rem', { lineHeight: '1.2' }],
      },
      spacing: {
        'touch-target': '44px', // Minimum touch target for mobile
      },
      borderRadius: {
        child: '12px', // Child-friendly rounded corners
      },
      animation: {
        'card-flip': 'flip 0.6s ease-in-out',
        celebration: 'celebration 0.8s ease-out',
        shake: 'shake 0.5s ease-in-out',
      },
      keyframes: {
        flip: {
          '0%': { transform: 'rotateY(0deg)' },
          '50%': { transform: 'rotateY(90deg)' },
          '100%': { transform: 'rotateY(0deg)' },
        },
        celebration: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'zoom-in': {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        'slide-in-from-bottom': {
          '0%': { transform: 'translateY(10px)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        'card-flip': 'flip 0.6s ease-in-out',
        celebration: 'celebration 0.8s ease-out',
        shake: 'shake 0.5s ease-in-out',
        'fade-in-0': 'fade-in 0.2s ease-out',
        'zoom-in-95': 'zoom-in 0.2s ease-out',
        'slide-in-from-bottom-2': 'slide-in-from-bottom 0.2s ease-out',
        'animate-in':
          'fade-in 0.2s ease-out, zoom-in 0.2s ease-out, slide-in-from-bottom 0.2s ease-out',
      },
      perspective: {
        1000: '1000px',
      },
      transform: {
        'preserve-3d': 'preserve-3d',
      },
      rotate: {
        'y-180': 'rotateY(180deg)',
      },
      backfaceVisibility: {
        hidden: 'hidden',
      },
    },
  },
  plugins: [],
};
