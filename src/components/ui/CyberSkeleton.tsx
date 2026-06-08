import { cn } from '@/lib/utils';

interface CyberSkeletonProps {
  className?: string;
}

/** Шиммер-скелетон в киберпанк-стиле (cyan-перелив) */
export const CyberSkeleton = ({ className }: CyberSkeletonProps) => (
  <span
    aria-hidden
    className={cn(
      'block cp-skeleton border border-cyan-300/15',
      className,
    )}
  />
);

export default CyberSkeleton;
