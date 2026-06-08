'use client';

import { useEffect, useRef } from 'react';

/** Фоновый «цифровой дождь» (Matrix / Blade Runner) на canvas. */
export default function MatrixRain() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const glyphs = 'アァカサタナハマヤラワ0123456789ABCDEF<>/\\|=+*#$%'.split('');
    const fontSize = 14;
    let cols = 0;
    let drops: number[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      cols = Math.floor(canvas.width / fontSize);
      drops = new Array(cols).fill(0).map(() => Math.random() * -50);
    };
    resize();
    window.addEventListener('resize', resize);

    let raf = 0;
    let last = 0;
    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      if (t - last < 55) return; // троттлинг ~18fps — атмосфера без нагрузки
      last = t;

      ctx.fillStyle = 'rgba(2, 6, 23, 0.12)'; // шлейф затухания
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < cols; i++) {
        const text = glyphs[Math.floor(Math.random() * glyphs.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        ctx.fillStyle = Math.random() > 0.985 ? '#FF2BD6' : 'rgba(34, 211, 238, 0.55)';
        ctx.fillText(text, x, y);
        if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.22 }}
      aria-hidden
    />
  );
}
