/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // extend: {
    //   animation: {
    //     'scan-line': 'scan-line 2s linear infinite',
    //   },
    //   keyframes: {
    //     'scan-line': {
    //       '0%': { transform: 'translateY(0)' },
    //       '100%': { transform: 'translateY(256px)' }, // 256px = 16rem = ความสูงของ frame
    //     }
    //   }
    // },
  },
  plugins: [],
}