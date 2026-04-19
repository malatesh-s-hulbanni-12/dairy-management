/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'dairy-blue': '#1E88E5',
                'dairy-cream': '#FFF8E1',
                'dairy-green': '#43A047',
                'dairy-red': '#E53935',
                'dairy-orange': '#FB8C00',
                'dairy-gray': '#37474F',
                'dairy-lightgray': '#666666',
            }
        },
    },
    plugins: [],
}