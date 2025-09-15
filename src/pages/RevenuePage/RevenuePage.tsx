import { useMemo } from 'react';

import { RevenueItem, RevenueMetrics, useRevenue } from '@/entities/Revenue';
import {
  CompoundCumulativeRevenue,
  CompoundFeeRevenueByChain,
  CompoundFeeRevenueReceived,
  CompoundRevenueBlock,
  RevenueBreakDownBlock,
  RevenueOverview
} from '@/features/Revenue';
import { Page, Text } from '@/shared/ui/atoms';

const RevenuePage = () => {
  const { data: revenueData, isPending: isLoading, isError } = useRevenue();

  const pageData: RevenueItem[] = useMemo(
    () => revenueData || [],
    [revenueData]
  );

  return (
    <Page isLoading={isLoading}>
      <div className='flex flex-col gap-6 md:gap-[40px] lg:gap-[50px]'>
        <div className='mt-5 flex flex-col gap-[15px] px-3 md:mt-0 md:px-0'>
          <Text
            tag='h1'
            size='32'
            weight='500'
          >
            Revenue
          </Text>
          <Text
            tag='p'
            size='15'
            className='text-primary-14 leading-[140%] md:leading-[100%]'
          >
            Track Compound Protocol revenue streams across various networks.
          </Text>
        </div>
        <div className='flex flex-col gap-2.5 md:gap-2.5 lg:gap-5'>
          <RevenueMetrics
            revenueData={pageData}
            isLoading={isLoading}
            isError={isError}
          />
          <RevenueOverview
            revenueData={pageData}
            isLoading={isLoading}
            isError={isError}
          />
          <CompoundCumulativeRevenue
            revenueData={pageData}
            isLoading={isLoading}
            isError={isError}
          />
          <CompoundFeeRevenueReceived
            revenueData={pageData}
            isLoading={isLoading}
            isError={isError}
          />
          <CompoundFeeRevenueByChain
            revenueData={pageData}
            isLoading={isLoading}
            isError={isError}
          />
          <CompoundRevenueBlock
            revenueData={pageData}
            isLoading={isLoading}
            isError={isError}
          />
          <RevenueBreakDownBlock
            revenueData={pageData}
            isLoading={isLoading}
            isError={isError}
          />
        </div>
      </div>
    </Page>
  );
};

export { RevenuePage };
