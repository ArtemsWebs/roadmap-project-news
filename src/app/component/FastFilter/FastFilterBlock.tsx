import useFastFilter from './useFastFilter';
import { cn } from '@/lib/utils';
import { FastFilterBlockProps } from './useFastFilter';
import useDynamicFastFilter from './useDynamicFastFilter';
import { DynamicFastFilterBlock } from './DynamicFastFilterBlock';

const FastFilterBlock = ({
  sortBy,
  totalResults,
  status,
}: FastFilterBlockProps) => {
  const { fastFilter } = useFastFilter({
    sortBy: sortBy,
    totalResults: totalResults,
    status: status,
  });
  const dynamicFastFilter = useDynamicFastFilter({});
  return (
    <div className="p-4 border-t border-cyan-300/40 w-full h-[60px]">
      <div className="flex gap-6">
        {fastFilter.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <div className="flex items-center gap-2">{item.icon}</div>
            <div className="flex items-start flex-col">
              <span className={'font-tech text-slate-400 tracking-[0.5px]'}>
                {item.name}
              </span>
              <span
                className={cn(
                  'font-orbitron font-bold tracking-[0.5px] ',
                  item.textColor,
                )}
              >
                {item.value}
              </span>
            </div>
          </div>
        ))}
        <DynamicFastFilterBlock
          dynamicFastFilter={dynamicFastFilter.dynamicFastFilter}
        />
      </div>
    </div>
  );
};

export default FastFilterBlock;
