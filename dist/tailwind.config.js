/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors:{
        "green":"#1db954",
        "dark":"#191414", 
        "black-base":"#121212",
        "black-primary":"#191414",
        "black-secondary":"#171818",
        "primary":"#ffffff",
        "light-black":"#282828",
        "gray":"#808080",
        "primary":"#FFFFFF",
        "secondary":"#b3b3b3",
      },
      gridTemplateColumns:{
        "auto-fill-cards":"repeat(auto-fill, minmax(200px, 1fr))"
      },
    },
  },
  plugins: [],
}

