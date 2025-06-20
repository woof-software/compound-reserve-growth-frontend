import Card from '@/shared/ui/Card/Card';
import Text from '@/shared/ui/Text/Text';
import ValueMetricField from '@/shared/ui/ValueMetricField/ValueMetricField';

const RunwayPage = () => {
  return (
    <div className='flex flex-col gap-[70px]'>
      <div className='flex flex-col gap-[15px]'>
        <Text
          tag='h1'
          size='32'
          weight='500'
        >
          Runway
        </Text>
        <Text
          tag='p'
          size='15'
          className='text-primary-14'
        >
          Track Aave DAO&apos;s financial health through treasury runway,
          expenses, and service provider commitments.
        </Text>
      </div>
      <div className='flex flex-col gap-5'>
        <div className='flex flex-row gap-5'>
          <Card className='flex-1'>
            <ValueMetricField
              value='$63.6M'
              label='Total Annualised Expenses'
            />
          </Card>
          <Card className='flex-1'>
            <ValueMetricField
              value='$28.3M'
              label='Service Provider Expenses'
            />
          </Card>
          <Card className='flex-1'>
            <ValueMetricField
              value='$35.3M'
              label='DAO Initiatives Expenses'
            />
          </Card>
        </div>

        <Card title='Annualised Expenses'>qwe</Card>
        <Card title='Current Service Providers'>qwe</Card>
        <Card title='Current Initiatives'>qwe</Card>
        <Card title='Full DAO Commitments'>qwe</Card>
      </div>
    </div>
  );
};

export default RunwayPage;
