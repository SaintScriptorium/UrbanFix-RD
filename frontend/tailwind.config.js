/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta inspirada en señalética municipal: azul plano ("blueprint")
        // como color de identidad, y ámbar de zona de obra como acento de
        // acción — coherente con un producto de reportes de infraestructura.
        blueprint: {
          950: '#0B1B2B',
          900: '#122A42',
          800: '#1B3B5B',
          700: '#254E77',
          600: '#336794',
        },
        asphalt: {
          50: '#F6F7F8',
          100: '#ECEEF0',
          400: '#8A93A0',
          600: '#5B6472',
          800: '#2E3440',
        },
        signal: {
          500: '#E8963A',
          600: '#D07F26',
        },
        alert: {
          600: '#B23A2E',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
