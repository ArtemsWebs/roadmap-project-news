import LogoContent from './LogoContent';
import TopMenu from './TopMenu';
import { NewsApiResponse, NewsApiSuccessResponse } from '../news/types';
import CrawlLine from './CrawlLine';

const Header = ({
  data,
  isLoading,
  error,
}: {
  data: NewsApiResponse;
  isLoading: boolean;
  error: Error | null;
}) => {
  return (
    <header>
      <TopMenu />
      <LogoContent />
      <CrawlLine news={data as NewsApiSuccessResponse} />
    </header>
  );
};

export default Header;
