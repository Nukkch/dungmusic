/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
    theme: {
    extend: {
      colors: {
        // Твои цвета по дизайну
        bg: '#0b1120',        // Глубокий темно-синий фон
        surface: '#1e293b',   // Чуть светлее для панелей
        border: '#334155',    // Цвет обводки
        text: '#f8fafc',      // Белый текст
        muted: '#94a3b8',     // Серый текст (второстепенный)
        primary: '#6366f1',   // Твой акцентный цвет (индиго)
      },
      keyframes: {
      'slide-in': {
        '0%': { transform: 'translateX(100%)', opacity: '0' },
        '100%': { transform: 'translateX(0)', opacity: '1' },
      }
    },
    animation: {
      'slide-in': 'slide-in 0.3s ease-out',
    }
    },
  },
  plugins: [],
}