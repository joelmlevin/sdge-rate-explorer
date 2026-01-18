/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette for rate visualization
        'rate-low': '#ef4444',    // red-500
        'rate-mid': '#f59e0b',    // amber-500
        'rate-high': '#10b981',   // emerald-500
      },
    },
  },
  plugins: [],
}
