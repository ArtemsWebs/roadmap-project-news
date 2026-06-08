import { cn } from '@/lib/utils';
import { SearchIcon } from 'lucide-react';

interface CyberSearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
  className?: string;
  maxChars?: number;
}

const CyberSearch = ({
  className,
  maxChars = 500,
  value,
  placeholder = 'Search',
  ...props
}: CyberSearchProps) => {
  const count = typeof value === 'string' ? value.length : 0;

  return (
    <div className="relative flex items-center justify-start gap-4 w-full">
      <p className="text-sm text-gray-500 absolute right-3 top-1/2 -translate-y-1/2">
        {count}/{maxChars}
      </p>
      <label htmlFor="search" className="absolute left-3">
        <SearchIcon className="w-4 h-4 text-cyan-300" />
      </label>
      <input
        {...props}
        id="search"
        type="text"
        value={value}
        maxLength={maxChars}
        placeholder={placeholder}
        className={cn(
          'w-full min-w-0 sm:min-w-[260px] h-[40px] px-12 py-0 pl-8',
          'border border-cyan-300/60 text-cyan-100 placeholder:text-cyan-300/40',
          'caret-cyan-300 outline-none transition-all duration-300 ease-out',
          'focus:border-cyan-300',
          'focus:shadow-[0_0_5px_#22d3ee,0_0_15px_#22d3ee,0_0_30px_rgba(34,211,238,0.5)]',
          'focus:placeholder:text-cyan-300/60',
          className,
        )}
        style={{
          background: 'rgba(0, 0, 0, 0.55)',
        }}
      />
    </div>
  );
};

export default CyberSearch;
