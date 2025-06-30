import Card from '@/shared/ui/Card/Card';
import ValueMetricField from '@/shared/ui/ValueMetricField/ValueMetricField';

const RunwayMetrics = () => {
  return (
    <div className='flex flex-row gap-5'>
      <Card className={{ container: 'flex-1' }}>
        <ValueMetricField
          value='$63.6M'
          label='Total Annualised Expenses'
        />
      </Card>

      <Card className={{ container: 'flex-1' }}>
        <ValueMetricField
          value='$28.3M'
          label='Service Provider Expenses'
        />
      </Card>

      <Card className={{ container: 'flex-1' }}>
        <ValueMetricField
          value='$35.3M'
          label='DAO Initiatives Expenses'
        />
      </Card>
    </div>
  );
};

export default RunwayMetrics;
