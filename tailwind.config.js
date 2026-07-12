/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta "Local Bold" — parrilla + salsa buffalo. Carbón cálido de
        // base con acentos de fuego (rojo chili, naranja ember, ámbar) y un
        // verde hierba de contrapunto. Distinta por completo del oro nocturno.
        bg: '#141110', // carbón cálido (fondo principal)
        card: '#1E1A17', // superficie de tarjeta
        card2: '#2A2420', // superficie elevada / hover
        line: '#3A322B', // borde definido
        cream: '#F8F2E8', // texto claro
        muted: '#B3A797', // texto secundario
        flame: '#E7392B', // rojo chili (acento primario)
        ember: '#F6852A', // naranja (acento secundario)
        amber: '#F5B22D', // ámbar / mostaza (acento cálido)
        chili: '#B71E17', // rojo profundo (sombras y degradados)
        herb: '#86BC3C', // verde hierba (etiquetas "fresco")
      },
      fontFamily: {
        // Anti-clon: display condensado pesado (rótulo de parrilla) + grotesk
        // amable de cuerpo. Nada que ver con el par serif/geométrico del otro sitio.
        display: ['Anton', 'Impact', 'sans-serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        // Lenguaje de formas: esquinas redondeadas medianas/grandes.
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        // Sombras duras con desplazamiento (neo-brutal suave).
        hard: '4px 4px 0 0 #0b0908',
        'hard-lg': '7px 7px 0 0 #0b0908',
        flame: '5px 5px 0 0 #B71E17',
        amber: '5px 5px 0 0 #B77A0F',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        wiggle: {
          '0%,100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
      },
      animation: {
        marquee: 'marquee 22s linear infinite',
        wiggle: 'wiggle 2.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
