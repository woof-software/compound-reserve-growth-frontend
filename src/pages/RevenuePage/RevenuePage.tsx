import Card from '@/shared/ui/Card/Card';
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

        <Card title='Revenue Overview USD'>qwe</Card>
        <Card title='Compound Cumulative Revenue'>qwe</Card>
        <Card title='Compound Fee Revenue Recieved'>qwe</Card>
        <Card title='Compound Fee Revenue by Chain'>qwe</Card>
        <Card title='Compound Revenue'>qwe</Card>
        <Card title='Revenue Breakdown'>qwe</Card>
      </div>
    </div>
  );
};

export default RevenuePage;
