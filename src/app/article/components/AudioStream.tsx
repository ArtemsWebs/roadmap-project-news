'use client';

import { useEffect, useRef, useState } from 'react';
import { Headphones, Square, Loader2 } from 'lucide-react';
import { useStatsStore } from '../../profile/statsStore';

/** basePath из next.config.ts — raw fetch его не подставляет автоматически */
const BASE_PATH = '/roadmap-project-news';
const MAX_CHARS = 2000;

type AudioState = 'idle' | 'loading' | 'playing' | 'error';

/** Озвучка статьи через F5-TTS микросервис (см. tts-service/) */
export const AudioStream = ({ text }: { text: string; lang?: string }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const [state, setState] = useState<AudioState>('idle');
  const addTtsListen = useStatsStore((s) => s.addTtsListen);

  // Очистка blob-URL и остановка воспроизведения при размонтировании
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const stop = () => {
    audioRef.current?.pause();
    setState('idle');
  };

  const play = async () => {
    if (state === 'playing' || state === 'loading') {
      stop();
      return;
    }
    setState('loading');
    try {
      const res = await fetch(`${BASE_PATH}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.slice(0, MAX_CHARS) }),
      });
      if (!res.ok) throw new Error('tts failed');

      const blob = await res.blob();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      const url = URL.createObjectURL(blob);
      urlRef.current = url;

      // Полностью настраиваем элемент ДО записи в ref (без мутаций после)
      audioRef.current?.pause();
      const audio = new Audio(url);
      audio.onended = () => setState('idle');
      audio.onerror = () => setState('error');
      audioRef.current = audio;
      await audio.play();
      setState('playing');
      addTtsListen();
    } catch {
      setState('error');
    }
  };

  return (
    <div>
      <p className="font-tech text-xs text-slate-500 mb-3">
        синтез голоса · f5-tts · neural_va
      </p>
      <button
        type="button"
        onClick={play}
        disabled={state === 'loading'}
        className="group relative w-full px-4 py-2 font-orbitron font-bold text-sm tracking-[2px] uppercase cursor-pointer overflow-hidden disabled:cursor-wait text-cyan-300"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-[#0a2a2a] to-[#1a0a2e] transition-all duration-300 group-hover:from-[#00F0FF]/20 group-hover:to-[#7C3AED]/30" />
        <span className="absolute inset-0 border border-cyan-300/70 transition-all duration-300 group-hover:shadow-[0_0_12px_#00F0FF]" />
        <span className="relative flex items-center justify-center gap-2">
          {state === 'loading' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> SYNTH...
            </>
          ) : state === 'playing' ? (
            <>
              <Square className="w-4 h-4" /> STOP
            </>
          ) : (
            <>
              <Headphones className="w-4 h-4" /> LISTEN
            </>
          )}
        </span>
      </button>
      {state === 'error' && (
        <p className="font-tech text-[10px] text-red-400/80 mt-2">
          {'// tts_unavailable'}
        </p>
      )}
    </div>
  );
};

export default AudioStream;
