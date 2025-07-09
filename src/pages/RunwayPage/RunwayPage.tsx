import AnnualisedExpensesBlock from '@/entities/Runway/AnnualisedExpenses';
import CurrentInitiativesBlock from '@/entities/Runway/CurrentInitiatives';
import CurrentServiceProvidersBlock from '@/entities/Runway/CurrentServiceProviders';
import FullDAOCommitmentsBlock from '@/entities/Runway/FullDAOCommitments';
import RunwayMetrics from '@/entities/Runway/RunwayMetrics';
import Text from '@/shared/ui/Text/Text';

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
          Track Compound DAO&apos;s financial health through treasury runway,
          expenses, and service provider commitments.
        </Text>
      </div>
      <div className='flex flex-col gap-5'>
        <RunwayMetrics />
        <AnnualisedExpensesBlock />
        <CurrentServiceProvidersBlock />
        <CurrentInitiativesBlock />
        <FullDAOCommitmentsBlock />
      </div>
    </div>
  );
};

export default RunwayPage;
