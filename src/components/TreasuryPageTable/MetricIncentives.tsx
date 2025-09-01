import { memo } from 'react';

import { useTheme } from '@/app/providers/ThemeProvider/theme-provider';
import { formatPrice, sumValues } from '@/shared/lib/utils/utils';
import { TokenData } from '@/shared/types/Treasury/types';
import { AssetType } from '@/shared/types/types';
import Card from '@/shared/ui/Card/Card';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';

type MetricData = {
  uniqDataByCategory: Record<string, TokenData[]>;

  uniqData30DaysOldByCategory: Record<string, TokenData[]>;
};

interface MetricBlockProps {
  isLoading?: boolean;
  data: MetricData;
}

const mapMetricData = ({
  uniqDataByCategory,
  uniqData30DaysOldByCategory
}: MetricData) => {
  // TOTAL VALUES
  const allItems = Object.values(uniqDataByCategory).flat();
  const totalValue = sumValues(allItems);
  const totalLastValue =
    totalValue - sumValues(Object.values(uniqData30DaysOldByCategory).flat());

  // COMP VALUES
  const compItems = uniqDataByCategory[AssetType.COMP] ?? [];
  const compTotalValue = sumValues(compItems);
  const compLastValue =
    compTotalValue -
    sumValues(uniqData30DaysOldByCategory[AssetType.COMP] ?? []);

  // NON-COMP VALUES
  const nonCompItems = Object.entries(uniqDataByCategory)
    .filter(([type]) => type !== AssetType.COMP)
    .flatMap(([, items]) => items);

  const nonCompItems30DaysOld = Object.entries(uniqData30DaysOldByCategory)
    .filter(([type]) => type !== AssetType.COMP)
    .flatMap(([, items]) => items);

  const nonCompTotalValue = sumValues(nonCompItems);
  const nonCompLastValue =
    nonCompTotalValue - sumValues(nonCompItems30DaysOld ?? []);

  //STABLECOIN VALUES
  const stablecoinItems = uniqDataByCategory[AssetType.STABLECOIN] ?? [];
  const stablecoinTotalValue = sumValues(stablecoinItems);
  const stablecoinLastValue =
    stablecoinTotalValue -
    sumValues(uniqData30DaysOldByCategory[AssetType.STABLECOIN] ?? []);

  // ETH CORRELATED VALUES
  const ethCorrelatedItems = uniqDataByCategory[AssetType.ETH_CORRELATED] ?? [];
  const ethCorrelatedHoldingTotalValue = sumValues(ethCorrelatedItems);
  const ethCorrelatedHoldingLastValue =
    ethCorrelatedHoldingTotalValue -
    sumValues(uniqData30DaysOldByCategory[AssetType.ETH_CORRELATED] ?? []);

  return {
    totalValue,
    totalLastValue,

    compTotalValue,
    compLastValue,

    nonCompTotalValue,
    nonCompLastValue,

    stablecoinTotalValue,
    stablecoinLastValue,

    ethCorrelatedHoldingTotalValue,
    ethCorrelatedHoldingLastValue
  };
};

const MetricIncentivesBlock = memo(({ data, isLoading }: MetricBlockProps) => {
  const { theme } = useTheme();

  const { totalValue, totalLastValue } = mapMetricData(data);

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
            content: 'flex items-center px-5 py-10 md:p-10'
          }}
        >
          <div className='grid gap-3'>
            <div className='flex items-center gap-2.5'>
              <Icon
                name='comp-metric'
                className='h-8 w-8'
              />
              <Text
                weight='700'
                size='32'
              >
                {formatPrice(totalValue, 1)}
              </Text>
            </div>
            <Text
              weight='500'
              size='13'
              className='text-primary-14'
            >
              {formatPrice(totalLastValue, 1)}
            </Text>
          </div>
        </Card>
        <Card
          title='Total lend incentives'
          isLoading={isLoading}
          className={{
            container: 'max-w-full min-w-64',
            loading: 'h-[200px]',
            header: 'px-5 py-4',
            content: 'flex items-center px-5 py-10 md:p-10'
          }}
        >
          <div className='grid gap-3'>
            <div className='flex items-center gap-2.5'>
              <Icon
                name='comp-metric'
                className='h-8 w-8'
              />
              <Text
                weight='700'
                size='32'
              >
                {formatPrice(totalValue, 1)}
              </Text>
            </div>
            <Text
              weight='500'
              size='13'
              className='text-primary-14'
            >
              {formatPrice(totalLastValue, 1)}
            </Text>
          </div>
        </Card>
      </div>
      <div className='flex flex-col gap-2.5 md:flex-row lg:gap-5'>
        <Card
          title='Total lend incentives'
          isLoading={isLoading}
          className={{
            container: 'max-w-full min-w-64',
            loading: 'h-[200px]',
            header: 'px-5 py-4',
            content: 'flex items-center px-5 py-10 md:p-10'
          }}
        >
          <div className='grid gap-3'>
            <div className='flex items-center gap-2.5'>
              <Icon
                name='comp-metric'
                className='h-8 w-8'
              />
              <Text
                weight='700'
                size='32'
              >
                {formatPrice(totalValue, 1)}
              </Text>
            </div>
            <Text
              weight='500'
              size='13'
              className='text-primary-14'
            >
              {formatPrice(totalLastValue, 1)}
            </Text>
          </div>
        </Card>
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
              <Text
                weight='700'
                size='32'
              >
                {formatPrice(totalValue, 1)}
              </Text>
            </div>
            <Text
              weight='500'
              size='13'
              className='text-primary-14'
            >
              {formatPrice(totalLastValue, 1)}
            </Text>
          </div>
          <Icon
            name={
              theme === 'dark' ? 'compound-metric-logo' : 'comp-metric-light'
            }
            className='absolute top-[-25px] right-5 z-[1] h-[190px] w-[150px]'
          />
        </Card>
      </div>
    </div>
  );
});

export default MetricIncentivesBlock;
