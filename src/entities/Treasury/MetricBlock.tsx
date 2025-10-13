import { memo } from 'react';

import { cn } from '@/shared/lib/classNames/classNames';
import { Format } from '@/shared/lib/utils/numbersFormatter';
import { sumValues } from '@/shared/lib/utils/utils';
import { TokenData } from '@/shared/types/Treasury/types';
import { AssetType } from '@/shared/types/types';
import Card from '@/shared/ui/Card/Card';
import Icon from '@/shared/ui/Icon/Icon';
import ValueMetricField from '@/shared/ui/ValueMetricField/ValueMetricField';

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
  const {
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
  } = mapMetricData(data);

  return (
    <div className='flex flex-col gap-0 md:gap-2.5 lg:gap-5'>
      <div className='flex flex-col gap-0 md:flex-row md:gap-2.5 lg:gap-5'>
        <Card
          isLoading={isLoading}
          className={{
            container: cn(
              'flex h-auto min-h-auto min-w-auto flex-1 items-center rounded-b-none sm:min-w-[343px] md:min-w-auto',
              {
                'min-h-[180px]': isLoading
              }
            ),
            content: 'w-full p-5 md:p-10'
          }}
        >
          <ValueMetricField
            className={{
              container: 'flex-wrap',
              content: ''
            }}
            label='Total Treasury Value'
            value={Format.price(totalValue, 'compact')}
            badge={Format.price(totalLastValue, 'compact')}
            badgeType={totalLastValue > 0 ? 'positive' : 'negative'}
            icon={
              <Icon
                name='wallet'
                className='h-8 w-8'
                isRound={false}
              />
            }
          />
        </Card>
        <Card
          isLoading={isLoading}
          className={{
            container: cn(
              'border-secondary-26 flex h-auto min-h-auto min-w-auto flex-1 items-center rounded-none border-t-1 border-b-1 sm:min-w-[343px] md:min-w-auto md:border-none',
              {
                'min-h-[180px]': isLoading
              }
            ),
            content: 'w-full p-5 md:p-10'
          }}
        >
          <ValueMetricField
            label='Total COMP Value'
            value={Format.price(compTotalValue, 'compact')}
            badge={Format.price(compLastValue, 'compact')}
            badgeType={compLastValue > 0 ? 'positive' : 'negative'}
            icon={
              <Icon
                name='comp-metric'
                className='h-8 w-8'
              />
            }
          />
        </Card>
        <Card
          isLoading={isLoading}
          className={{
            container: cn(
              'border-b-secondary-26 flex h-auto min-h-auto min-w-auto flex-1 items-center rounded-b-none border-b-1 sm:min-w-[343px] md:min-w-auto md:border-none',
              {
                'min-h-[180px]': isLoading
              }
            ),
            content: 'w-full p-5 md:p-10'
          }}
        >
          <ValueMetricField
            label='Total Non-Comp Value'
            value={Format.price(nonCompTotalValue, 'compact')}
            badge={Format.price(nonCompLastValue, 'compact')}
            badgeType={nonCompLastValue > 0 ? 'positive' : 'negative'}
            icon={
              <Icon
                name='total-non-comp-value'
                className='h-8 w-8'
              />
            }
          />
        </Card>
      </div>
      <div className='flex flex-col gap-0 md:flex-row md:gap-2.5 lg:gap-5'>
        <Card
          isLoading={isLoading}
          className={{
            container: cn(
              'border-b-secondary-26 flex h-auto min-h-auto min-w-auto flex-1 items-center rounded-t-none rounded-b-none border-b-1 sm:min-w-[343px] md:min-w-auto md:border-none',
              {
                'min-h-[180px]': isLoading
              }
            ),
            content: 'w-full p-5 md:p-10'
          }}
        >
          <ValueMetricField
            className={{
              container: 'gap-10',
              value: '!text-[23px]'
            }}
            iconText='Stablecoin Holdings'
            label='Total Stablecoin Holdings'
            value={Format.price(stablecoinTotalValue, 'compact')}
            badge={Format.price(stablecoinLastValue, 'compact')}
            badgeType={stablecoinLastValue > 0 ? 'positive' : 'negative'}
            icon={
              <Icon
                name='stablecoin'
                className='h-8 w-8'
                folder='token'
              />
            }
          />
        </Card>
        <Card
          isLoading={isLoading}
          className={{
            container: cn(
              'flex h-auto min-h-auto min-w-auto flex-1 items-center rounded-t-none sm:min-w-[343px] md:min-w-auto',
              {
                'min-h-[180px]': isLoading
              }
            ),
            content: 'w-full p-5 md:p-10'
          }}
        >
          <ValueMetricField
            className={{
              container: 'gap-10',
              value: '!text-[23px]'
            }}
            iconText='ETH Correlated Holdings'
            label='Total ETH Correlated Holdings'
            value={Format.price(ethCorrelatedHoldingTotalValue, 'compact')}
            badge={Format.price(ethCorrelatedHoldingLastValue, 'compact')}
            badgeType={
              ethCorrelatedHoldingLastValue > 0 ? 'positive' : 'negative'
            }
            icon={
              <Icon
                name='eth-metric'
                className='h-8 w-8'
              />
            }
          />
        </Card>
      </div>
    </div>
  );
});

export default MetricBlock;
