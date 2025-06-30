import RevenueBreakdown from '@/components/RevenuePageTable/RevenueBreakdown';
import Card from '@/shared/ui/Card/Card';

const RevenueBreakDownBlock = () => {
  return (
    <Card
      title='Revenue Breakdown'
      className={{ content: 'flex flex-col gap-3 px-10 pt-0 pb-10' }}
    >
      <div className='flex gap-3 px-0 py-3'>Year btn</div>

      <RevenueBreakdown />
    </Card>
  );
};

export default RevenueBreakDownBlock;
