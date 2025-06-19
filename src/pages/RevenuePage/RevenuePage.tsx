import Card from '@/shared/ui/Card/Card';

const RevenuePage = () => {
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
          <Card className='flex-1'>qwe</Card>
          <Card className='flex-1'>qwe</Card>
          <Card className='flex-1'>qwe</Card>
        </div>

        <Card title='Annualised Expenses'>qwe</Card>
        <Card title='Current Service Providers'>qwe</Card>
        <Card title='Current Initiatives'>qwe</Card>
        <Card title='Full DAO Commitments'>qwe</Card>
      </div>
    </div>
  );
};

export default RevenuePage;
