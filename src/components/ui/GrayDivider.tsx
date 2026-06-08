import { cn } from '@/lib/utils';

export const GrayDivider = ({ className }: { className?: string }) => {
  return <div className={cn('w-[1px] h-[70%]  bg-gray-500', className)} />;
};
