import { NewsApiSuccessResponse } from '../news/types';
import SearchBlock from './SearchBlock';
import FastFilterBlock from './FastFilter/FastFilterBlock';
import { NewsBlock } from '../news/view/NewsBlock';

interface MainBlockProps {
  data: NewsApiSuccessResponse;
  isLoading: boolean;
  error: Error | null;
  page: number;
  onPageChange: (page: number) => void;
}

const MainBlock = ({ data, page, onPageChange }: MainBlockProps) => {
  return (
    <div className="w-[70%] mx-auto">
      <div
        className="flex flex-col justify-center items-center border border-cyan-300/60  p-5  relative my-11"
        style={{ background: 'rgba(15, 12, 36, 0.78)' }}
      >
        <div
          className="absolute left-1 top-1 w-full h-full"
          style={{
            background:
              'linear-gradient(173deg, rgba(0, 0, 0, 0.00) 40%, rgba(0, 240, 255, 0.08) 50%, rgba(0, 0, 0, 0.00) 60%)',
          }}
        />
        <SearchBlock />
        <FastFilterBlock
          sortBy="publishedAt"
          totalResults={data?.articles?.totalResults}
          status={data?.articles ? 'ok' : 'error'}
        />
      </div>
      <NewsBlock
        articles={data?.articles}
        page={page}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default MainBlock;
