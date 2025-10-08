import { useTheme } from '@/app/providers/ThemeProvider/theme-provider';
import { getTotalMetricValues } from '@/entities/Insentive/MetricBlock/lib/utils';
import { formatNumber } from '@/shared/lib/utils/utils';
import { CombinedIncentivesData } from '@/shared/types/Incentive/types';
import Card from '@/shared/ui/Card/Card';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';

interface MetricBlockProps {
  data: CombinedIncentivesData[];
  isLoading: boolean;
  activeTab: string;
}

const MetricBlock = (props: MetricBlockProps) => {
  const { data, isLoading, activeTab } = props;
  const { theme } = useTheme();
  const metrics = getTotalMetricValues(data, activeTab);

  return (
    <div className='flex flex-col gap-2.5 lg:gap-5'>
      <div className='flex flex-col gap-2.5 md:flex-row lg:gap-5'>
        <Card
          title='Total lend incentives'
          isLoading={isLoading}
          className={{
            container: 'max-w-full min-w-64',
            loading: 'h-[200px]',
            header: 'px-5 py-4',
            content:
              'relative flex items-center overflow-clip bg-[linear-gradient(270deg,#B9E6D9_2.63%,#FFFFFF_100%)] px-5 py-10 md:p-10 dark:bg-[linear-gradient(270deg,#154F48_2.63%,#1D2833_100%)]'
          }}
        >
          <div className='grid gap-3'>
            <div className='flex items-center gap-2.5'>
              <Text
                weight='700'
                size='32'
              >
                {formatNumber(metrics.totalLendIncentives, '')}
              </Text>
            </div>
            <Text
              weight='500'
              size='13'
              className='text-primary-14'
            >
              {formatNumber(metrics.totalLendIncentivesUsdPrice)}
            </Text>
          </div>
          <Icon
            name={
              theme === 'dark' ? 'compound-metric-logo' : 'comp-metric-light'
            }
            className='absolute top-[-25px] right-5 z-[1] h-[190px] w-[180px]'
          />
        </Card>
        <Card
          title='Total borrow incentives'
          isLoading={isLoading}
          className={{
            container: 'max-w-full min-w-64',
            loading: 'h-[200px]',
            header: 'px-5 py-4',
            content:
              'relative flex items-center overflow-clip bg-[linear-gradient(270deg,#B9E6D9_2.63%,#FFFFFF_100%)] px-5 py-10 md:p-10 dark:bg-[linear-gradient(270deg,#154F48_2.63%,#1D2833_100%)]'
          }}
        >
          <div className='grid gap-3'>
            <div className='flex items-center gap-2.5'>
              <Text
                weight='700'
                size='32'
              >
                {formatNumber(metrics.totalBorrowIncentives, '')}
              </Text>
            </div>
            <Text
              weight='500'
              size='13'
              className='text-primary-14'
            >
              {formatNumber(metrics.totalBorrowIncentivesUsdPrice)}
            </Text>
          </div>
          <Icon
            name={
              theme === 'dark' ? 'compound-metric-logo' : 'comp-metric-light'
            }
            className='absolute top-[-25px] right-[5px] z-[1] h-[190px] w-[180px] lg:right-5'
          />
        </Card>
      </div>
      <div className='flex flex-col gap-2.5 md:flex-row lg:gap-5'>
        <Card
          title='Total incentives'
          isLoading={isLoading}
          className={{
            container: 'max-w-full min-w-64',
            loading: 'h-[200px]',
            header: 'px-5 py-4',
            content:
              'relative flex items-center overflow-clip bg-[linear-gradient(270deg,#B9E6D9_2.63%,#FFFFFF_100%)] px-5 py-10 md:p-10 dark:bg-[linear-gradient(270deg,#154F48_2.63%,#1D2833_100%)]'
          }}
        >
          <div className='grid gap-3'>
            <div className='flex items-center gap-2.5'>
              <Text
                weight='700'
                size='32'
              >
                {formatNumber(metrics.totalIncentives, '')}
              </Text>
            </div>
            <Text
              weight='500'
              size='13'
              className='text-primary-14'
            >
              {formatNumber(metrics.totalIncentivesUsdPrice)}
            </Text>
          </div>
          <Icon
            name={
              theme === 'dark' ? 'compound-metric-logo' : 'comp-metric-light'
            }
            className='absolute top-[-25px] right-5 z-[1] h-[190px] w-[180px]'
          />
        </Card>
        <Card
          title='Total fees incentives'
          isLoading={isLoading}
          className={{
            container: 'max-w-full min-w-64',
            loading: 'h-[200px]',
            header: 'px-5 py-4',
            content:
              'relative flex items-center overflow-clip bg-[linear-gradient(270deg,#B9E6D9_2.63%,#FFFFFF_100%)] px-5 py-10 md:p-10 dark:bg-[linear-gradient(270deg,#154F48_2.63%,#1D2833_100%)]'
          }}
        >
          <div className='grid gap-3'>
            <div className='flex items-center gap-2.5'>
              <Text
                weight='700'
                size='32'
              >
                {formatNumber(metrics.totalFeesGenerated, '')}
              </Text>
            </div>
            <Text
              weight='500'
              size='13'
              className='text-primary-14'
            >
              {formatNumber(metrics.totalFeesGeneratedUsdPrice)}
            </Text>
          </div>
          <Icon
            name={
              theme === 'dark' ? 'compound-metric-logo' : 'comp-metric-light'
            }
            className='absolute top-[-25px] right-5 z-[1] h-[190px] w-[180px]'
          />
        </Card>
      </div>
    </div>
  );
};

export default MetricBlock;
