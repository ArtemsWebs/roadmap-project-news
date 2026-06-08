import { cn } from '@/lib/utils';

export const GradientDivider = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn('h-[1px] w-[70%] opacity-60', className)}
      style={{
        background:
          'linear-gradient(90deg, rgba(0, 0, 0, 0.00) 0%, #00F0FF 33.33%, #FF2BD6 66.67%, rgba(0, 0, 0, 0.00) 100%)',
      }}
    />
  );
};
