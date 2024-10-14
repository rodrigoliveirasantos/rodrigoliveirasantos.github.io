const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      container: {
        center: true,
        padding: "1rem"
      },
      fontFamily: {
        mono: ["Fragment Mono", "monospace"],
        sans: ["Manrope", "sans-serif"]
      },
      colors: {
        foreground: {
          DEFAULT: "hsl(var(--clr-foreground))"
        },
        primary: {
          DEFAULT: "hsl(var(--clr-primary))",
          foreground: "hsl(var(--clr-primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--clr-secondary))",
          foreground: "hsl(var(--clr-secondary-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--clr-destructive))",
          foreground: "hsl(var(--clr-destructive-foreground))"
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
};
