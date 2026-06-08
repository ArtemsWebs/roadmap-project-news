import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  basePath: '/roadmap-project-news',
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
