import TreasuryHoldings from '@/components/TreasuryPageTable/TreasuryHoldings';
import Card from '@/shared/ui/Card/Card';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
import ValueMetricField from '@/shared/ui/ValueMetricField/ValueMetricField';

import WalletIcon from '@/assets/svg/wallet.svg';

const TreasuryPage = () => {
  return (
    <div className='flex flex-col gap-[70px]'>
      <div>
        <h1 className='mb-4 text-[32px] font-bold text-gray-900'>Treasury</h1>
        <p>
          Track Compound DAOs treasury portfolio including asset allocation,
          strategic holdings, and investment returns.
        </p>
      </div>
      <div className='flex flex-col gap-5'>
        <div className='flex flex-row gap-5'>
          <Card className='flex-1'>
            <ValueMetricField
              value='$115.6M'
              label='Total Non-Comp Value'
              badge='+57M'
              badgeType='positive'
              icon={<WalletIcon className='h-[32px] w-[32px]' />}
              iconText='any text icon'
            />
          </Card>
          <Card className='flex-1'>
            <ValueMetricField
              value='$115.6M'
              label='Service Provider Expenses'
            />
          </Card>
          <Card className='flex-1'>
            <ValueMetricField
              value='$115.6M'
              label='Total Revenue'
            />
            <ValueMetricField
              value='$115.6M'
              label='YoY Growth'
            />
          </Card>
        </div>
        <div className='flex flex-row gap-5'>
          <Card className='flex-1'>qwe</Card>
          <Card className='flex-1'>qwe</Card>
        </div>
        <Card title='Treasury Composition'>
          <TabsGroup tabs={['q', 'w', 'e', 'r']} />
        </Card>
        <Card title='Total Treasury Value'>qwe</Card>
        <Card title='Treasury Balance by Network'>qwe</Card>
        <Card title='Full Treasury Holdings'>
          <TreasuryHoldings />
        </Card>
      </div>
    </div>
  );
};

export default TreasuryPage;
