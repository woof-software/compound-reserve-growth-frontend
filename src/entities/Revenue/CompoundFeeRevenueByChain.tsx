import CompoundFeeRevenuebyChain from '@/components/RevenuePageTable/CompoundFeeRevenuebyChain';
import Card from '@/shared/ui/Card/Card';

const CompoundFeeRevenueByChain = () => {
  return (
    <Card
      title='Compound Fee Revenue by Chain'
      className={{ content: 'flex flex-col gap-3 px-10 pt-0 pb-10' }}
    >
      <div className='flex gap-3 px-0 py-3'>Interval Year</div>
      <CompoundFeeRevenuebyChain />
    </Card>
  );
};

export default CompoundFeeRevenueByChain;
