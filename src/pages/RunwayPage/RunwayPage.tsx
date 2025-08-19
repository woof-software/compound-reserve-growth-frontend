import AnnualisedExpensesBlock from '@/entities/Runway/AnnualisedExpenses';
import CurrentInitiativesBlock from '@/entities/Runway/CurrentInitiatives';
import CurrentServiceProvidersBlock from '@/entities/Runway/CurrentServiceProviders';
import FullDAOCommitmentsBlock from '@/entities/Runway/FullDAOCommitments';
import RunwayMetrics from '@/entities/Runway/RunwayMetrics';
import { useRunway } from '@/shared/hooks/useRunway';
import { useScrollToHash } from '@/shared/hooks/useScrollToHash';
import Text from '@/shared/ui/Text/Text';

const RunwayPage = () => {
  const { isLoading } = useRunway();
  useScrollToHash(!isLoading);
  return (
    <div className='flex flex-col gap-6 md:gap-[42px] lg:gap-[70px]'>
      <div className='mt-5 flex flex-col gap-[15px] px-3 md:mt-0 md:px-0'>
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
          className='text-primary-14 leading-[140%] md:leading-[100%]'
        >
          Track Compound DAO&apos;s financial health through treasury runway,
          expenses, and service provider commitments.
        </Text>
      </div>
      <div className='flex flex-col gap-2.5 md:gap-5'>
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
