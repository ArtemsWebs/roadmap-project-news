import { PulseIcon } from '@/shared/icons/Pulse';
import { DatabaseIcon, SortAscIcon } from 'lucide-react';

interface DynamicFastFilterBlockProps {
  id: string;
  name: string;
  icon: React.ReactNode;
  value: string;
  textColor: string;
}


const useDynamicFastFilter = ({}: { sortBy: string; totalResults: string }) => {
  return {
    dynamicFastFilter: [],
  };
};

export default useDynamicFastFilter;
