import { NewsApiSuccessResponse } from '../news/types';
import SearchBlock from './SearchBlock';
import FastFilterBlock from './FastFilterBlock';

const MainBlock = ({}: {
  data: NewsApiSuccessResponse;
  isLoading: boolean;
  error: Error | null;
}) => {
  return (
    <div
      className="flex flex-col justify-center items-center border border-cyan-300/60  p-5 w-[70%] mx-auto relative m-10"
      style={{ background: 'rgba(15, 12, 36, 0.78)' }}
    >
      <div
        className="absolute left-1 top-1 w-full h-full"
        style={{
          background:
            'linear-gradient(173deg, rgba(0, 0, 0, 0.00) 40%, rgba(0, 240, 255, 0.08) 50%, rgba(0, 0, 0, 0.00) 60%)',
        }}
      ></div>
      <SearchBlock />
      <FastFilterBlock />
    </div>
  );
};

export default MainBlock;
