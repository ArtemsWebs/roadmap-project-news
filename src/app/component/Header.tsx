'use client';
import LogoContent from './LogoContent';
import TopMenu from './TopMenu';
import { NewsApiResponse, NewsApiSuccessResponse } from '../news/types';
import CrawlLine from './CrawlLine';
import ProfileCard from '@/components/profile/ProfileCard';

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
      <div className="relative">
        <LogoContent />
        <div className="absolute top-1/2 right-3 md:right-6 -translate-y-1/2 z-10">
          <ProfileCard variant="header" />
        </div>
      </div>
      <CrawlLine news={data as NewsApiSuccessResponse} />
    </header>
  );
};

export default Header;
