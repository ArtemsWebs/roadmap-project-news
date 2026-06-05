import { PulseIcon } from '@/shared/icons/Pulse';
import { DatabaseIcon } from 'lucide-react';
import { SortAscIcon } from 'lucide-react';

export interface FastFilterBlockProps {
  sortBy: string;
  totalResults: number;
  status?: 'ok' | 'error' | 'not_found' | 'other';
}

const getStatusColor = (status?: 'ok' | 'error' | 'not_found' | 'other') => {
  return status === 'ok'
    ? 'text-cyan-400'
    : status === 'error'
      ? 'text-red-400'
      : status === 'not_found'
        ? 'text-gray-400'
        : 'text-gray-400';
};

const useFastFilter = ({
  sortBy,
  totalResults,
  status,
}: FastFilterBlockProps) => {
  return {
    fastFilter: [
      {
        id: 'status',
        name: 'Status',
        icon: <PulseIcon />,
        value: status?.toUpperCase(),
        textColor: getStatusColor(status),
      },
      {
        id: 'totalResults',
        name: 'Total_Results',
        value: totalResults,
        icon: <DatabaseIcon className="text-cyberPink-500" />,
        textColor: 'text-cyberPink-500',
      },
      {
        id: 'sortBy',
        name: 'Sort_By',
        value: sortBy,
        icon: <SortAscIcon className="text-yellow-300" />,
        textColor: 'text-yellow-300',
      },
    ],
  };
};

export default useFastFilter;
