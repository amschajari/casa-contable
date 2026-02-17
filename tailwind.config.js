/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'selector',
    theme: {
        extend: {
            colors: {
                main: 'var(--bg-main)',
                card: 'var(--bg-card)',
                brand: {
                    DEFAULT: 'var(--brand-primary)',
                    dark: 'var(--brand-dark)',
                }
            }
        },
    },
    plugins: [],
}
