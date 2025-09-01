import { useMemo } from 'react';

import CompoundCumulativeRevenue from '@/entities/Revenue/CompoundCumulativeRevenue';
import CompoundFeeRevenueByChain from '@/entities/Revenue/CompoundFeeRevenueByChain';
import CompoundFeeRevenueRecieved from '@/entities/Revenue/CompoundFeeRevenueRecieved';
import CompoundRevenueBlock from '@/entities/Revenue/CompoundRevenue';
import RevenueBreakDownBlock from '@/entities/Revenue/RevenueBreakdown';
import RevenueMetrics from '@/entities/Revenue/RevenueMetrics';
import RevenueOverview from '@/entities/Revenue/RevenueOverview';
import { RevenueItem, useRevenue } from '@/shared/hooks/useRevenue';
import { useScrollToHash } from '@/shared/hooks/useScrollToHash';
import Text from '@/shared/ui/Text/Text';

const RevenuePage = () => {
  const { data: revenueData, isPending: isLoading, isError } = useRevenue();

  const pageData: RevenueItem[] = useMemo(
    () => revenueData || [],
    [revenueData]
  );

  useScrollToHash(!isLoading);

  return (
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
        {/* TODO Refactor Performance*/}
        <CompoundFeeRevenueRecieved
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
        {/* TODO Refactor Performance*/}
      </div>
    </div>
  );
};

export default RevenuePage;
