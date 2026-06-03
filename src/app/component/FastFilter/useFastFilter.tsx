import { PulseIcon } from '@/shared/icons/Pulse';

const useFastFilter = () => {
  return {
    fastFilter: [
      {
        id: 'status',
        name: 'Status',
        icon: <PulseIcon />,
        value: 'all',
      },
      {
        id: 'totalResults',
        name: 'Total_Results',
        value: 'all',
      },
      {
        id: 'sortBy',
        name: 'Sort_By',
        value: 'all',
      },
    ],
  };
};

export default useFastFilter;
