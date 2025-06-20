import TreasuryHoldings from '@/components/TreasuryPageTable/TreasuryHoldings';
import Card from '@/shared/ui/Card/Card';
import FallbackImage from '@/shared/ui/FallbackImage/FallbackImage';
import Switch from '@/shared/ui/Switch/Switch';
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
          tag='p'
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
                <FallbackImage
                  src='svg/wallet.svg'
                  width={32}
                  height={32}
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
                <FallbackImage
                  src='not-found-icon.svg'
                  width={32}
                  height={32}
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
                <FallbackImage
                  src='not-found-icon.svg'
                  width={32}
                  height={32}
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
                <FallbackImage
                  src='not-found-icon.svg'
                  width={32}
                  height={32}
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
                <FallbackImage
                  src='not-found-icon.svg'
                  width={32}
                  height={32}
                />
              }
            />
          </Card>
        </div>
        <Card title='Treasury Composition'>
          <TabsGroup tabs={['q', 'w', 'e', 'r']} />
        </Card>
        <Card title='Total Treasury Value'>
          <FallbackImage src='svg/storage.svg' />
          <Switch />
          <Switch
            label='sgdfgdfg'
            positionLabel='left'
          />
          <Switch
            label='sgdfgdfg'
            positionLabel='right'
          />
        </Card>
        <Card title='Treasury Balance by Network'>qwe</Card>
        <Card title='Full Treasury Holdings'>
          <TreasuryHoldings />
        </Card>
      </div>
    </div>
  );
};

export default TreasuryPage;
