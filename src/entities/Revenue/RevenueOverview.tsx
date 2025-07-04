import React from 'react';

import PieChart from '@/components/Charts/Pie/Pie';
import RevenueOverviewUSD from '@/components/RevenuePageTable/RevenueOverviewUSD';
import Card from '@/shared/ui/Card/Card';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';

const RevenueOverview = () => {
  return (
    <Card
      title='Revenue Overview USD'
      className={{ content: 'flex flex-col gap-3 px-10 pt-0 pb-10' }}
    >
      <div className='flex justify-end gap-3 px-0 py-3'>
        <TabsGroup
          tabs={['7D', '30D', '90D']}
          defaultTab='7D'
        />
        <TabsGroup
          tabs={['Rolling', 'To Date']}
          defaultTab='Rolling'
        />
      </div>
      <div className='flex justify-between'>
        <RevenueOverviewUSD />
        <PieChart
          className='max-h-[400px] max-w-[336.5px]'
          data={[
            { name: 'AAVE', percent: 70.67, value: '1.54M' },
            { name: 'Stablecoin', percent: 14.77, value: '1.54k' },
            { name: 'ETH Correlated', percent: 4.86, value: '0.54k' },
            { name: 'DeFi', percent: 2.63, value: '0.23k' },
            { name: 'BTC Correlated', percent: 2.6, value: '5.54k' },
            { name: 'Unclassified', percent: 2.6, value: '0.54k' }
          ]}
        />
      </div>
    </Card>
  );
};

export default RevenueOverview;
