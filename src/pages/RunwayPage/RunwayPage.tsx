import { RunwayMetrics, useRunway } from '@/entities/Runway';
import {
  AnnualisedExpensesBlock,
  CurrentInitiativesBlock,
  CurrentServiceProvidersBlock,
  FullDAOCommitmentsBlock
} from '@/features/Runway';
import { Page, Text } from '@/shared/ui/atoms';

const RunwayPage = () => {
  const { isLoading } = useRunway();

  return (
    <Page isLoading={isLoading}>
      <div className='flex flex-col gap-6 md:gap-[40px] lg:gap-[50px]'>
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
        <div className='flex flex-col gap-2.5 md:gap-2.5 lg:gap-5'>
          <RunwayMetrics />
          <AnnualisedExpensesBlock />
          <CurrentServiceProvidersBlock />
          <CurrentInitiativesBlock />
          <FullDAOCommitmentsBlock />
        </div>
      </div>
    </Page>
  );
};

export { RunwayPage };
