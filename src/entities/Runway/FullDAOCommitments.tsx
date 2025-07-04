import CSVDownloadButton from '@/components/CSVDownloadButton/CSVDownloadButton';
import FullDAOCommitments from '@/components/RunwayPageTable/FullDAOCommitments';
import { FULL_DAO_COMMITMENTS_DATA } from '@/components/RunwayPageTable/MOCK_DATA';
import Card from '@/shared/ui/Card/Card';

const FullDAOCommitmentsBlock = () => {
  return (
    <Card
      title='Full DAO Commitments'
      className={{ content: 'flex flex-col gap-3 px-10 pt-0 pb-10' }}
    >
      <div className='flex justify-end gap-3 px-0 py-3'>
        <CSVDownloadButton
          data={FULL_DAO_COMMITMENTS_DATA}
          filename='Full DAO Commitments'
        />
      </div>
      <FullDAOCommitments />
    </Card>
  );
};

export default FullDAOCommitmentsBlock;
