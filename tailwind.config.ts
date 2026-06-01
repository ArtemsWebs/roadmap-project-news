import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      fontFamily: {
        orbitron: ["var(--font-orbitron)"],
        tech: ["var(--font-share-tech-mono)"],
      },
    },
  },
};