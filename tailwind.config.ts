import type { Config } from 'tailwindcss';

const config: Config = {
  theme: {
    colors: {
      'yellow-300': '#F7FF3C',
      'cyberPink-500': '#FF2BD6',
    },
    backgroundColor: {
      'lime-green': 'rgba(247, 255, 60, 0.1)',
      'cyberPink-500': '#FF2BD6',
    },
    extend: {
      fontFamily: {
        orbitron: ['var(--font-orbitron)'],
        tech: ['var(--font-share-tech-mono)'],
      },
    },
  },
};
