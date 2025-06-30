import CompoundCumulativeRevenue from '@/entities/Revenue/CompoundCumulativeRevenue';
import CompoundFeeRevenueByChain from '@/entities/Revenue/CompoundFeeRevenueByChain';
import CompoundFeeRevenueRecieved from '@/entities/Revenue/CompoundFeeRevenueRecieved';
import CompoundRevenueBlock from '@/entities/Revenue/CompoundRevenue';
import RevenueBreakDownBlock from '@/entities/Revenue/RevenueBreakdown';
import RevenueMetrics from '@/entities/Revenue/RevenueMetrics';
import RevenueOverview from '@/entities/Revenue/RevenueOverview';
import Text from '@/shared/ui/Text/Text';

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

        <CompoundFeeRevenueRecieved />

        <CompoundFeeRevenueByChain />

        <CompoundRevenueBlock />

        <RevenueBreakDownBlock />
      </div>
    </div>
  );
};

export default RevenuePage;
