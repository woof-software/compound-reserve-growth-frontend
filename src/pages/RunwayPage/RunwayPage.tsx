import Card from '@/shared/ui/Card/Card';

const RunwayPage = () => {
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
          <Card
            className='flex-1'
            title='2022 Revenue'
          >
            qwe
          </Card>
          <Card
            className='flex-1'
            title='2023 Revenue'
          >
            qwe
          </Card>
          <Card
            className='flex-1'
            title='2024 Revenue'
          >
            qwe
          </Card>
          <Card
            className='flex-1'
            title='2025 Revenue'
          >
            qwe
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

export default RunwayPage;
