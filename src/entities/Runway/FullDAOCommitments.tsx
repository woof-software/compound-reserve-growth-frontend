import FullDAOCommitments from '@/components/RunwayPageTable/FullDAOCommitments';
import Card from '@/shared/ui/Card/Card';

const FullDAOCommitmentsBlock = () => {
  return (
    <Card
      title='Full DAO Commitments'
      className={{ content: 'flex flex-col gap-3 px-10 pt-0 pb-10' }}
    >
      <div className='flex gap-3 px-0 py-3'>BTN</div>

      <FullDAOCommitments />
    </Card>
  );
};

export default FullDAOCommitmentsBlock;
