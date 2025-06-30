import RevenueOverviewUSD from '@/components/RevenuePageTable/RevenueOverviewUSD';
import Card from '@/shared/ui/Card/Card';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';

const RevenueOverview = () => {
  return (
    <Card
      title='Revenue Overview USD'
      className={{ content: 'flex flex-col gap-3 px-10 pt-0 pb-10' }}
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
  );
};

export default RevenueOverview;
