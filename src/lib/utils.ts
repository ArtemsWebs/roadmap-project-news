import { clsx, type ClassValue } from 'clsx';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** ISO 8601 → `31 мая 2026 г. // 18:50` (локальное время, ru) */
export function formatDate(date: string): string {
  return format(parseISO(date), "d MMMM yyyy 'г.' // HH:mm", { locale: ru });
}

