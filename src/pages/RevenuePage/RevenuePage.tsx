import CompoundFeeRevenuebyChain from '@/components/RevenuePageTable/CompoundFeeRevenuebyChain';
import RevenueBreakdown from '@/components/RevenuePageTable/RevenueBreakdown';
import RevenueOverviewUSD from '@/components/RevenuePageTable/RevenueOverviewUSD';
import Card from '@/shared/ui/Card/Card';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
import Text from '@/shared/ui/Text/Text';
import ValueMetricField from '@/shared/ui/ValueMetricField/ValueMetricField';

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
        <div className='flex flex-row gap-5'>
          <Card
            className='flex-1'
            title='2022 Revenue'
          >
            <div className='flex flex-col gap-8'>
              <ValueMetricField
                value='$5,224,376'
                label='Total Revenue'
              />
              <ValueMetricField
                value='-'
                label='YoY Growth'
              />
            </div>
          </Card>
          <Card
            className='flex-1'
            title='2023 Revenue'
          >
            <div className='flex flex-col gap-8'>
              <ValueMetricField
                value='$5,224,376'
                label='Total Revenue'
              />
              <ValueMetricField
                value='-'
                label='YoY Growth'
              />
            </div>
          </Card>
          <Card
            className='flex-1'
            title='2024 Revenue'
          >
            <div className='flex flex-col gap-8'>
              <ValueMetricField
                value='$5,224,376'
                label='Total Revenue'
              />
              <ValueMetricField
                value='-'
                label='YoY Growth'
              />
            </div>
          </Card>
          <Card
            className='flex-1'
            title='2025 Revenue'
          >
            <div className='flex flex-col gap-8'>
              <ValueMetricField
                value='$5,224,376'
                label='Total Revenue'
              />
              <ValueMetricField
                value='-'
                label='YoY Growth'
              />
            </div>
          </Card>
        </div>

        <Card
          title='Revenue Overview USD'
          contentClassName='pt-0 pb-10 px-10 flex flex-col gap-3'
        >
          <div className='flex gap-3 px-0 py-3'>
            <TabsGroup
              tabs={['7D', '30D', '90D']}
              defaultTab='7D'
            />
            <TabsGroup
              tabs={['Rolling', 'To Date']}
              defaultTab='Rolling'
            />
          </div>
          <RevenueOverviewUSD />
        </Card>
        <Card
          title='Compound Cumulative Revenue'
          contentClassName='pt-0 pb-10 px-10 flex flex-col gap-3'
        >
          <div className='flex gap-3 px-0 py-3'>
            <TabsGroup
              tabs={['7D', '30D', '90D']}
              defaultTab='7D'
            />
          </div>
          qwe
        </Card>
        <Card
          title='Compound Fee Revenue Recieved'
          contentClassName='pt-0 pb-10 px-10 flex flex-col gap-3'
        >
          <div className='flex gap-3 px-0 py-3'>
            <TabsGroup
              tabs={['7D', '30D', '90D']}
              defaultTab='7D'
            />
          </div>
          qwe
        </Card>
        <Card
          title='Compound Fee Revenue by Chain'
          contentClassName='pt-0 pb-10 px-10 flex flex-col gap-3'
        >
          <div className='flex gap-3 px-0 py-3'>Interval Year</div>
          <CompoundFeeRevenuebyChain />
        </Card>
        <Card
          title='Compound Revenue'
          contentClassName='pt-0 pb-10 px-10 flex flex-col gap-3'
        >
          {' '}
          <div className='flex gap-3 px-0 py-3'>
            <TabsGroup
              tabs={['7D', '30D', '90D']}
              defaultTab='7D'
            />
          </div>
          qwe
        </Card>
        <Card
          title='Revenue Breakdown'
          contentClassName='pt-0 pb-10 px-10 flex flex-col gap-3'
        >
          <div className='flex gap-3 px-0 py-3'>Year btn</div>
          <RevenueBreakdown />
        </Card>
      </div>
    </div>
  );
};

export default RevenuePage;
