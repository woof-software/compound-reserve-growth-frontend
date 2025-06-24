import * as React from 'react';

import CryptoChart from '@/components/Charts/Bar/Bar';
import TreasuryBalanceByNetwork from '@/components/TreasuryPageTable/TreasuryBalanceByNetwork';
import TreasuryComposition from '@/components/TreasuryPageTable/TreasuryComposition';
import TreasuryHoldings from '@/components/TreasuryPageTable/TreasuryHoldings';
import Card from '@/shared/ui/Card/Card';
import Icon from '@/shared/ui/Icon/Icon';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
import Text from '@/shared/ui/Text/Text';
import ValueMetricField from '@/shared/ui/ValueMetricField/ValueMetricField';

const TreasuryPage = () => {
  return (
    <div className='flex flex-col gap-[70px]'>
      <div className='flex flex-col gap-[15px]'>
        <Text
          tag='h1'
          size='32'
          weight='500'
        >
          Treasury
        </Text>
        <Text
          size='15'
          className='text-primary-14'
        >
          Track Compound DAO&apos;s treasury portfolio including asset
          allocation, strategic holdings, and investment returns.
        </Text>
      </div>
      <div className='flex flex-col gap-5'>
        <div className='flex flex-row gap-5'>
          <Card className='flex-1'>
            <ValueMetricField
              value='$115.6M'
              label='Total Non-Comp Value'
              badge='+57M'
              badgeType='positive'
              icon={
                <Icon
                  name='wallet'
                  className='h-8 w-8'
                />
              }
            />
          </Card>
          <Card className='flex-1'>
            <ValueMetricField
              value='$115.6M'
              label='Total Non-Comp Value'
              badge='+57M'
              badgeType='positive'
              icon={
                <Icon
                  name='not-found-icon'
                  className='h-8 w-8'
                />
              }
            />
          </Card>
          <Card className='flex-1'>
            <ValueMetricField
              value='$115.6M'
              label='Total Non-Comp Value'
              badge='+57M'
              badgeType='positive'
              icon={
                <Icon
                  name='not-found-icon'
                  className='h-8 w-8'
                />
              }
            />
          </Card>
        </div>
        <div className='flex flex-row gap-5'>
          <Card className='flex-1'>
            <ValueMetricField
              className='gap-10'
              value='$115.6M'
              label='Total Non-Comp Value'
              badge='-57M'
              badgeType='negative'
              iconText='Total Value'
              icon={
                <Icon
                  name='not-found-icon'
                  className='h-8 w-8'
                />
              }
            />
          </Card>
          <Card className='flex-1'>
            <ValueMetricField
              className='gap-10'
              value='$115.6M'
              label='Total Non-Comp Value'
              badge='-57M'
              badgeType='negative'
              iconText='Total Value'
              icon={
                <Icon
                  name='not-found-icon'
                  className='h-8 w-8'
                />
              }
            />
          </Card>
        </div>
        <Card
          title='Treasury Composition'
          contentClassName='pt-0 pb-10 px-10 flex flex-col gap-3'
        >
          <div className='flex gap-3 px-0 py-3'>Asset Type</div>
          <TreasuryComposition />
        </Card>
        <Card
          title='Total Treasury Value'
          contentClassName='pt-0 pb-10 px-10 flex flex-col gap-3'
        >
          <div className='flex gap-3 px-0 py-3'>
            <TabsGroup
              tabs={['7D', '30D', '90D', '1Y']}
              defaultTab='7D'
            />

            <TabsGroup
              tabs={['H', 'D', 'W']}
              defaultTab='D'
            />
          </div>
        </Card>
        <Card
          title='Treasury Balance by Network'
          contentClassName='pt-0 pb-10 px-10 flex flex-col gap-3'
        >
          <div className='flex gap-3 px-0 py-3'>BTN</div>
          <div className='flex justify-between gap-10'>
            <CryptoChart
              data={[
                { name: 'AAVE', value: 150000000, color: '#4F7CFF' },
                { name: 'Stablecoin', value: 35000000, color: '#00D4AA' },
                { name: 'ETH Correlated', value: 30000000, color: '#F0E68C' },
                { name: 'DeFi', value: 8500000, color: '#FF6B6B' },
                { name: 'BTC Correlated', value: 50000000, color: '#8B5CF6' },
                { name: 'Unclassified', value: 35000000, color: '#FF8C42' }
              ]}
            />
            <TreasuryBalanceByNetwork />
          </div>
        </Card>
        <Card title='Full Treasury Holdings'>
          <TreasuryHoldings />
        </Card>
      </div>
    </div>
  );
};

export default TreasuryPage;
