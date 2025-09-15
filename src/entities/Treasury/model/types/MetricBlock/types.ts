import { TokenData } from '@/shared/types';

type MetricData = {
  uniqDataByCategory: Record<string, TokenData[]>;

  uniqData30DaysOldByCategory: Record<string, TokenData[]>;
};

interface MetricBlockProps {
  isLoading?: boolean;
  data: MetricData;
}

export type { MetricBlockProps, MetricData };
