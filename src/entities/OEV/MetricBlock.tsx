import { memo } from 'react';

import { useTheme } from '@/app/providers/ThemeProvider/theme-provider';
import { cn } from '@/shared/lib/classNames/classNames';
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

const MetricBlock = memo(({ data, isLoading }: MetricBlockProps) => {
  const { theme } = useTheme();

  const { totalValue } = mapMetricData(data);

  return (
    <div className='flex flex-col gap-2.5 lg:gap-5'>
      <div className='flex flex-col gap-2.5 md:flex-row lg:gap-5'>
        <Card
          title='BTC corellated'
          isLoading={isLoading}
          className={{
            container: 'max-w-full min-w-64',
            loading: 'h-[200px]',
            header: 'px-5 py-4',
            content:
              'relative flex items-center overflow-clip bg-[linear-gradient(270deg,#E0B177_0%,#FFFFFF_100%)] px-5 py-10 md:p-10 dark:bg-[linear-gradient(270deg,#F7931A_-56.86%,#1D2833_88.01%)]'
          }}
        >
          <div className='grid gap-3'>
            <div className='flex items-center gap-2.5'>
              <Icon
                name='btc-corellated-icon'
                className='h-8 w-8'
              />
              <Text
                weight='700'
                size='32'
              >
                {formatPrice(totalValue, 1)}
              </Text>
            </div>
          </div>
          <Icon
            name={theme === 'dark' ? 'BTC-corellated-bg' : 'BTC-light'}
            className={cn(
              'absolute right-0 z-[1] h-[110px] w-[203px] scale-110',
              {
                'opacity-20': theme === 'light'
              }
            )}
          />
        </Card>
        <Card
          title='Stablecoin corellated'
          isLoading={isLoading}
          className={{
            container: 'max-w-full min-w-64',
            loading: 'h-[200px]',
            header: 'px-5 py-4',
            content:
              'relative flex items-center overflow-clip bg-[linear-gradient(270deg,#8BDDC4_0%,#FFFFFF_100%)] px-5 py-10 md:p-10 dark:bg-[linear-gradient(270deg,#0F7A62_0%,#1D2833_100%)]'
          }}
        >
          <div className='grid gap-3'>
            <div className='flex items-center gap-2.5'>
              <Icon
                name='stablecoin-corellated-icon'
                className='h-8 w-8'
              />
              <Text
                weight='700'
                size='32'
              >
                {formatPrice(totalValue, 1)}
              </Text>
            </div>
          </div>
          <Icon
            name={
              theme === 'dark' ? 'stablecoin-corellated-bg' : 'stablecoin-light'
            }
            className={cn(
              'absolute right-2.5 z-[1] h-[110px] w-[170px] scale-110',
              {
                'opacity-20': theme === 'light'
              }
            )}
          />
        </Card>
      </div>
      <div className='flex flex-col gap-2.5 md:flex-row lg:gap-5'>
        <Card
          title='ETH corellated'
          isLoading={isLoading}
          className={{
            container: 'max-w-full min-w-64',
            loading: 'h-[200px]',
            header: 'px-5 py-4',
            content:
              'relative flex items-center overflow-clip bg-[linear-gradient(270deg,#97ADFF_0%,#FFFFFF_100%)] px-5 py-10 md:p-10 dark:bg-[linear-gradient(270deg,#5168BC_0%,#1D2833_100%)]'
          }}
        >
          <div className='grid gap-3'>
            <div className='flex items-center gap-2.5'>
              <Icon
                name='eth-corellated-icon'
                className='h-8 w-8'
              />
              <Text
                weight='700'
                size='32'
              >
                {formatPrice(totalValue, 1)}
              </Text>
            </div>
          </div>
          <Icon
            name={theme === 'dark' ? 'eth-corellated-bg' : 'ETH-light'}
            className={cn(
              'absolute right-5 z-[1] h-[110px] w-[170px] scale-110',
              {
                'opacity-20': theme === 'light'
              }
            )}
          />
        </Card>
        <Card
          title='Total OEV fees captured'
          isLoading={isLoading}
          className={{
            container: 'max-w-full min-w-64',
            loading: 'h-[200px]',
            header: 'px-5 py-4',
            content:
              'relative flex items-center overflow-clip bg-[linear-gradient(270deg,#55BAED_0%,#FFFFFF_100%)] px-5 py-10 md:p-10 dark:bg-[linear-gradient(270deg,#00AAFF_0%,#1D2833_88.01%)]'
          }}
        >
          <div className='grid gap-3'>
            <div className='flex items-center gap-2.5'>
              <Icon
                name={
                  theme === 'dark'
                    ? 'fees-captured-icon'
                    : 'fees-captured-light-icon'
                }
                className='h-8 w-8'
              />
              <Text
                weight='700'
                size='32'
              >
                {formatPrice(totalValue, 1)}
              </Text>
            </div>
          </div>
          <Icon
            name={
              theme === 'dark'
                ? 'total-OEV-fees-captured'
                : 'total-OEV-fees-captured-light'
            }
            className={cn(
              'absolute right-5 z-[1] h-[110px] w-[170px] scale-110',
              {
                'opacity-20': theme === 'light'
              }
            )}
          />
        </Card>
      </div>
    </div>
  );
});

export default MetricBlock;
