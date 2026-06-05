import { cn } from '@/lib/utils';
import { Dot } from 'lucide-react';

interface DotDelimetrProps {
  isAnimation?: boolean;
  className?: string;
}

export const DotDelimetr = ({ className, isAnimation }: DotDelimetrProps) => {
  return (
    <Dot
      className={cn(
        'w-1 h-1 bg-fuchsia-400 rounded-full',
        isAnimation ? 'animate-ping' : '',
        className,
      )}
    />
  );
};
