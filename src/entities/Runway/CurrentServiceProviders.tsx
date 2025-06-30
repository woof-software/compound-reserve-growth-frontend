import React from 'react';

import PieChart from '@/components/Charts/Pie/Pie';
import CurrentServiceProviders from '@/components/RunwayPageTable/CurrentServiceProviders';
import Card from '@/shared/ui/Card/Card';

const CurrentServiceProvidersBlock = () => {
  return (
    <Card title='Current Service Providers'>
      <div className='flex justify-between'>
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

        <CurrentServiceProviders />
      </div>
    </Card>
  );
};

export default CurrentServiceProvidersBlock;
