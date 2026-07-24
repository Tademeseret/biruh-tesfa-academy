// tailwind.config.js
// Brand palette: white background, green (growth/education) + blue (trust/sky)
// as the two accent/text colors, per the school's requested identity.
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          green: {
            DEFAULT: '#15803D', // primary text/accent green
            light: '#DCFCE7',
            dark: '#14532D',
          },
          blue: {
            DEFAULT: '#1D4ED8', // primary text/accent blue
            light: '#DBEAFE',
            dark: '#1E3A8A',
          },
        },
      },
      fontFamily: {
        sans: ['"Noto Sans Ethiopic"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
