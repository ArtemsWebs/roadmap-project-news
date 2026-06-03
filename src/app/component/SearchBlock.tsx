import CyberButton from '@/components/ui/CyberButton';
import CyberSearch from '@/components/ui/CyberSearch';
import { FilterIcon } from 'lucide-react';

const SearchBlock = () => {
  return (
    <div className="w-full p-4  relative">
      <div className="flex items-center justify-start gap-4 mb-4">
        <CyberSearch placeholder="Search" className="w-full" />
        <CyberButton
          onClick={() => {
            console.log('Search');
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <FilterIcon className="w-4 h-4" />
            <span className="text-sm font-orbitron font-bold text-[#00F0FF] tracking-widest uppercase">
              Filters
            </span>
          </div>
        </CyberButton>
      </div>
    </div>
  );
};

export default SearchBlock;
