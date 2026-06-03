import { cn } from '@/lib/utils';
import { SearchIcon } from 'lucide-react';
import { useState } from 'react';

interface CyberSearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
  className?: string;
}

const CyberSearch = (props: CyberSearchProps) => {
  const [symbolsCount, setSymbolsCount] = useState(0);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSymbolsCount(e.target.value.length);
  };
  return (
    <div className="relative flex items-center justify-start gap-4 w-full">
      <p className="text-sm text-gray-500 absolute right-3 top-1/2 -translate-y-1/2">
        {symbolsCount}/500
      </p>
      <label htmlFor="search" className="absolute left-3">
        <SearchIcon className="w-4 h-4 text-cyan-300" />
      </label>
      <input
        {...props}
        id="search"
        type="text"
        onChange={handleChange}
        placeholder="Search"
        className={cn(
          'min-w-[260px] h-[40px] px-12 py-0 pl-8',
          'border border-cyan-300/60 text-cyan-100 placeholder:text-cyan-300/40',
          'caret-cyan-300 outline-none transition-all duration-300 ease-out',
          // неоновое свечение при фокусе
          'focus:border-cyan-300',
          'focus:shadow-[0_0_5px_#22d3ee,0_0_15px_#22d3ee,0_0_30px_rgba(34,211,238,0.5)]',
          'focus:placeholder:text-cyan-300/60',
          props.className,
        )}
        style={{
          background: 'rgba(0, 0, 0, 0.55)',
        }}
      />
    </div>
  );
};

export default CyberSearch;
