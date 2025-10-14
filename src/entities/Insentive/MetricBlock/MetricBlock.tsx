import { ReactNode } from 'react';

import { useTheme } from '@/app/providers/ThemeProvider/theme-provider';
import { getTotalMetricValues } from '@/entities/Insentive/MetricBlock/lib/utils';
import { Format } from '@/shared/lib/utils/numbersFormatter';
import { CombinedIncentivesData } from '@/shared/types/Incentive/types';
import Card from '@/shared/ui/Card/Card';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';
import { Tooltip } from '@/shared/ui/Tooltip/Tooltip';

interface MetricBlockProps {
  data: CombinedIncentivesData[];
  isLoading: boolean;
  activeTab: string;
}

const TooltipIncentive = ({ children }: { children: ReactNode }) => {
  return (
    <Tooltip
      content={
        <div>
          <Text
            weight='500'
            size='11'
            lineHeight='16'
            className='text-primary-14'
          >
            Data for the recent 24 hours.
          </Text>
          <Text
            weight='500'
            size='11'
            lineHeight='16'
            className='text-primary-14'
          >
            Updates daily at 12:05 PM UTC.
          </Text>
        </div>
      }
    >
      {children}
    </Tooltip>
  );
};

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
              <Icon
                name='comp-metric'
                className='h-8 w-8'
              />
              <TooltipIncentive>
                <Text
                  weight='700'
                  size='32'
                >
                  {Format.token(metrics.totalLendIncentives, 'standard')}
                </Text>
              </TooltipIncentive>
            </div>
            <Text
              weight='500'
              size='13'
              className='text-primary-14'
            >
              {Format.price(metrics.totalLendIncentivesUsdPrice, 'standard')}
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
              <Icon
                name='comp-metric'
                className='h-8 w-8'
              />
              <TooltipIncentive>
                <Text
                  weight='700'
                  size='32'
                >
                  {Format.token(metrics.totalBorrowIncentives, 'standard')}
                </Text>
              </TooltipIncentive>
            </div>
            <Text
              weight='500'
              size='13'
              className='text-primary-14'
            >
              {Format.price(metrics.totalBorrowIncentivesUsdPrice, 'standard')}
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
              <Icon
                name='comp-metric'
                className='h-8 w-8'
              />
              <TooltipIncentive>
                <Text
                  weight='700'
                  size='32'
                >
                  {Format.token(metrics.totalIncentives, 'standard')}
                </Text>
              </TooltipIncentive>
            </div>
            <Text
              weight='500'
              size='13'
              className='text-primary-14'
            >
              {Format.price(metrics.totalIncentivesUsdPrice, 'standard')}
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
          title='Total revenue granted'
          isLoading={isLoading}
          className={{
            container: 'max-w-full min-w-64',
            loading: 'h-[200px]',
            header: 'px-5 py-4',
            content:
              'relative flex items-center overflow-clip bg-[linear-gradient(270deg,#B9E6D9_2.63%,#FFFFFF_100%)] px-5 py-10 md:px-10 md:py-13 dark:bg-[linear-gradient(270deg,#154F48_2.63%,#1D2833_100%)]'
          }}
        >
          <div className='grid gap-3'>
            <div className='flex items-center gap-2.5'>
              <TooltipIncentive>
                <Text
                  weight='700'
                  size='32'
                >
                  {Format.price(metrics.totalFeesGeneratedUsdPrice, 'standard')}
                </Text>
              </TooltipIncentive>
            </div>
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
