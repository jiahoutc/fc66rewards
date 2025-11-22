/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                background: '#0a0a0a',
                foreground: '#ededed',
                primary: '#FFD700', // Gold
                'casino-red': '#8B0000', // Dark Red
                'casino-green': '#006400', // Dark Green
                'neon-gold': '#FFEB3B',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'bounce-slight': 'bounceSlight 1s infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                glow: {
                    '0%': { boxShadow: '0 0 5px #FFD700' },
                    '100%': { boxShadow: '0 0 20px #FFD700, 0 0 10px #FF4500' },
                },
                bounceSlight: {
                    '0%, 100%': { transform: 'translateY(-2%)' },
                    '50%': { transform: 'translateY(0)' },
                }
            },
        },
    },
    plugins: [],
}
