import useFastFilter from './useFastFilter';
import { cn } from '@/lib/utils';
import { FastFilterBlockProps } from './useFastFilter';
import { CyberSkeleton } from '@/components/ui/CyberSkeleton';

interface Props extends FastFilterBlockProps {
  isLoading?: boolean;
}

const FastFilterBlock = ({
  sortBy,
  totalResults,
  status,
  isLoading = false,
}: Props) => {
  const { fastFilter } = useFastFilter({ sortBy, totalResults, status });

  return (
    <div className="min-h-[44px]">
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {fastFilter.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <div className="flex items-center gap-2">{item.icon}</div>
            <div className="flex items-start flex-col">
              <span className="font-tech text-slate-400 tracking-[0.5px]">
                {item.name}
              </span>
              {isLoading ? (
                <CyberSkeleton className="h-[14px] w-16 mt-[3px]" />
              ) : (
                <span
                  className={cn(
                    'font-orbitron font-bold tracking-[0.5px]',
                    item.textColor,
                  )}
                >
                  {item.value}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FastFilterBlock;
