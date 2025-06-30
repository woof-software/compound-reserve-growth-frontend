import { lazy, Suspense } from 'react';

import CompoundCumulativeRevenue from '@/entities/Revenue/CompoundCumulativeRevenue';
import CompoundFeeRevenueByChain from '@/entities/Revenue/CompoundFeeRevenueByChain';
import CompoundRevenueBlock from '@/entities/Revenue/CompoundRevenue';
import RevenueBreakDownBlock from '@/entities/Revenue/RevenueBreakdown';
import RevenueMetrics from '@/entities/Revenue/RevenueMetrics';
import RevenueOverview from '@/entities/Revenue/RevenueOverview';
import Text from '@/shared/ui/Text/Text';

const CompoundFeeRevenueRecieved = lazy(
  () => import('@/entities/Revenue/CompoundFeeRevenueRecieved')
);

const RevenuePage = () => {
  return (
    <div className='flex flex-col gap-[70px]'>
      <div className='flex flex-col gap-[15px]'>
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
          className='text-primary-14'
        >
          Track Compound Protocol revenue streams across various networks.
        </Text>
      </div>

      <div className='flex flex-col gap-5'>
        <RevenueMetrics />

        <RevenueOverview />

        <CompoundCumulativeRevenue />

        <Suspense
          fallback={
            <div className='flex h-[300px] items-center justify-center text-sm text-gray-500'>
              Loading revenue chart…
            </div>
          }
        >
          <CompoundFeeRevenueRecieved />
        </Suspense>

        <CompoundFeeRevenueByChain />

        <CompoundRevenueBlock />

        <RevenueBreakDownBlock />
      </div>
    </div>
  );
};

export default RevenuePage;
