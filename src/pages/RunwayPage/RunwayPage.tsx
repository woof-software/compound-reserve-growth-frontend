import CSVDownloadButton from '@/components/CSVDownloadButton/CSVDownloadButton';
import AnnualisedExpenses from '@/components/RunwayPageTable/AnnualisedExpenses';
import CurrentInitiatives from '@/components/RunwayPageTable/CurrentInitiatives';
import CurrentServiceProviders from '@/components/RunwayPageTable/CurrentServiceProviders';
import FullDAOCommitments from '@/components/RunwayPageTable/FullDAOCommitments';
import { FULL_DAO_COMMITMENTS_DATA } from '@/components/RunwayPageTable/MOCK_DATA';
import Card from '@/shared/ui/Card/Card';
import Text from '@/shared/ui/Text/Text';
import ValueMetricField from '@/shared/ui/ValueMetricField/ValueMetricField';

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
          Track Aave DAO&apos;s financial health through treasury runway,
          expenses, and service provider commitments.
        </Text>
      </div>
      <div className='flex flex-col gap-5'>
        <div className='flex flex-row gap-5'>
          <Card className={{ container: 'flex-1' }}>
            <ValueMetricField
              value='$63.6M'
              label='Total Annualised Expenses'
            />
          </Card>
          <Card className={{ container: 'flex-1' }}>
            <ValueMetricField
              value='$28.3M'
              label='Service Provider Expenses'
            />
          </Card>
          <Card className={{ container: 'flex-1' }}>
            <ValueMetricField
              value='$35.3M'
              label='DAO Initiatives Expenses'
            />
          </Card>
        </div>

        <Card title='Annualised Expenses'>
          <div className='flex flex-col gap-5'>
            <AnnualisedExpenses />
            <div>
              <Text
                size='11'
                weight='500'
                className='text-primary-14'
                lineHeight='18'
              >
                1M USD ImmuneFi Bug Bounty program is excluded from above
              </Text>
              <Text
                size='11'
                weight='500'
                className='text-primary-14'
                lineHeight='18'
              >
                Table assumes an Compound price of $150
              </Text>
            </div>
          </div>
        </Card>
        <Card title='Current Service Providers'>
          <CurrentServiceProviders />
        </Card>
        <Card title='Current Initiatives'>
          <CurrentInitiatives />
        </Card>
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
      </div>
    </div>
  );
};

export default RunwayPage;
