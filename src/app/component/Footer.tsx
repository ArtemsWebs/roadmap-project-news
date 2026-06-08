'use client';

import { Dot } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative z-10 mt-10 border-t border-cyan-300/30 bg-[#05050f]/70 backdrop-blur-[2px]">
      {/* верхняя неоновая линия */}
      <div
        className="h-[1px] w-full opacity-70"
        style={{
          background:
            'linear-gradient(90deg, rgba(0,0,0,0) 0%, #00F0FF 33%, #FF2BD6 66%, rgba(0,0,0,0) 100%)',
        }}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 md:px-8 py-4">
        {/* Лево: копирайт */}
        <p className="font-tech text-xs md:text-sm text-slate-500 tracking-[0.5px] text-center sm:text-left">
          © 2077 <span className="text-cyan-300/80">NEON://NEWS</span> — все
          права защищены globally
        </p>

        {/* Центр: статус-индикатор */}
        <div className="flex items-center gap-1 order-3 sm:order-2">
          <Dot className="w-1 h-1 bg-cyan-400 rounded-full animate-ping" />
          <span className="font-tech text-[11px] md:text-xs text-cyan-400/80 tracking-[1px] uppercase">
            uplink_stable
          </span>
        </div>

        {/* Право: источник данных */}
        <a
          href="https://newsapi.ai/"
          target="_blank"
          rel="noopener noreferrer"
          className="order-2 sm:order-3 font-tech text-xs md:text-sm text-cyan-300 hover:text-cyan-100 tracking-[0.5px] transition-colors"
        >
          {'// powered by News API'}
        </a>
      </div>
    </footer>
  );
};

export default Footer;
