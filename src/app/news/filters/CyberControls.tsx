'use client';

import { cn } from '@/lib/utils';
import { CheckIcon } from 'lucide-react';

/** Заголовок секции с ▸ маркером */
export const FieldLabel = ({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between mb-2">
    <span className="font-tech text-xs tracking-[2px] uppercase text-cyan-300/90">
      <span className="text-cyberPink-500">▸ </span>
      {children}
    </span>
    {hint && (
      <span className="font-tech text-[10px] tracking-[1px] text-slate-500">
        {hint}
      </span>
    )}
  </div>
);

/** Однострочный/многострочный текстовый ввод в киберпанк-стиле */
export const CyberInput = ({
  className,
  textarea,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> &
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    textarea?: boolean;
  }) => {
  const base = cn(
    'w-full bg-black/55 border border-cyan-300/40 text-cyan-100',
    'placeholder:text-cyan-300/30 font-tech text-sm px-3 py-2 outline-none',
    'transition-all duration-300',
    'focus:border-cyan-300 focus:shadow-[0_0_6px_#22d3ee,0_0_16px_rgba(34,211,238,0.4)]',
    className,
  );
  if (textarea) {
    return (
      <textarea
        {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        className={cn(base, 'resize-none')}
      />
    );
  }
  return (
    <input
      {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
      className={base}
    />
  );
};

/** Чип-переключатель (для searchIn / language / dataType) */
export const CyberToggle = ({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'font-tech text-xs tracking-[1px] uppercase px-3 py-[6px] border transition-all duration-200 cursor-pointer',
      active
        ? 'border-cyberPink-500 text-cyberPink-500 bg-cyberPink-500/10 shadow-[0_0_8px_rgba(255,43,214,0.45)]'
        : 'border-cyan-300/30 text-slate-400 hover:border-cyan-300/70 hover:text-cyan-200',
    )}
  >
    {children}
  </button>
);

/** Полноширинная радио-строка (для SORT_BY) */
export const CyberRadioRow = ({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'w-full flex items-center justify-between px-4 py-2 border transition-all duration-200 cursor-pointer font-orbitron text-sm tracking-[1px]',
      active
        ? 'border-cyan-300 text-cyan-200 bg-cyan-300/10 shadow-[0_0_10px_rgba(34,211,238,0.35)]'
        : 'border-cyan-300/25 text-slate-400 hover:border-cyan-300/60 hover:text-cyan-100',
    )}
  >
    <span>{children}</span>
    {active && <CheckIcon className="w-4 h-4 text-cyan-300" />}
  </button>
);
