import Card from '@/shared/ui/Card/Card';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';

const CompoundCumulativeRevenue = () => {
  return (
    <Card
      title='Compound Cumulative Revenue'
      className={{ content: 'flex flex-col gap-3 px-10 pt-0 pb-10' }}
    >
      <div className='flex gap-3 px-0 py-3'>
        <TabsGroup
          tabs={['7B', '30B', '90B']}
          defaultTab='7B'
        />
      </div>
      qwe
    </Card>
  );
};

export default CompoundCumulativeRevenue;
