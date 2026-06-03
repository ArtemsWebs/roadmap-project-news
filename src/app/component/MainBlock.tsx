import { NewsApiSuccessResponse } from '../news/types';
import SearchBlock from './SearchBlock';

const MainBlock = ({}: {
  data: NewsApiSuccessResponse;
  isLoading: boolean;
  error: Error | null;
}) => {
  return (
    <div className="w-full mx-auto">
      <SearchBlock />
    </div>
  );
};

export default MainBlock;
