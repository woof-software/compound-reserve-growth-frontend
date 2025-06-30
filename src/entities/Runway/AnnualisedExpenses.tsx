import React from 'react';

import PieChart from '@/components/Charts/Pie/Pie';
import AnnualisedExpenses from '@/components/RunwayPageTable/AnnualisedExpenses';
import Card from '@/shared/ui/Card/Card';
import Text from '@/shared/ui/Text/Text';

const AnnualisedExpensesBlock = () => {
  return (
    <Card title='Annualised Expenses'>
      <div className='flex justify-between'>
        <div className='flex w-[650px] flex-col gap-5'>
          <AnnualisedExpenses />

          <div>
            <Text
              size='11'
              weight='500'
              className='text-primary-14'
              lineHeight='18'
            >
              1M USD ImmuneFi Bug Bounty program is excluded from above
            </Text>

            <Text
              size='11'
              weight='500'
              className='text-primary-14'
              lineHeight='18'
            >
              Table assumes an Compound price of $150
            </Text>
          </div>
        </div>

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

export default AnnualisedExpensesBlock;
