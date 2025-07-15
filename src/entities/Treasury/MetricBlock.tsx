import { memo } from 'react';

import { formatPrice, sumValues } from '@/shared/lib/utils/utils';
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
    <div className='flex flex-col gap-5'>
      <div className='flex flex-row gap-5'>
        <Card
          isLoading={isLoading}
          className={{ container: 'h-[200px] flex-1' }}
        >
          <ValueMetricField
            label='Total Treasury Value'
            value={formatPrice(totalValue, 1)}
            badge={formatPrice(totalLastValue, 1)}
            badgeType={totalLastValue > 0 ? 'positive' : 'negative'}
            icon={
              <Icon
                name='wallet'
                className='h-8 w-8'
              />
            }
          />
        </Card>
        <Card
          isLoading={isLoading}
          className={{ container: 'h-[200px] flex-1' }}
        >
          <ValueMetricField
            label='Total COMP Value'
            value={formatPrice(compTotalValue, 1)}
            badge={formatPrice(compLastValue, 1)}
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
          className={{ container: 'h-[200px] flex-1' }}
        >
          <ValueMetricField
            label='Total Non-Comp Value'
            value={formatPrice(nonCompTotalValue)}
            badge={formatPrice(nonCompLastValue, 1)}
            badgeType={nonCompLastValue > 0 ? 'positive' : 'negative'}
            icon={<div className='bg-success-11 h-8 w-8 rounded-full' />}
          />
        </Card>
      </div>
      <div className='flex flex-row gap-5'>
        <Card
          isLoading={isLoading}
          className={{ container: 'h-[225px] flex-1' }}
        >
          <ValueMetricField
            className={{
              container: 'gap-10'
            }}
            iconText='Stablecoin Holdings'
            label='Total Stablecoin Holdings'
            value={formatPrice(stablecoinTotalValue)}
            badge={formatPrice(stablecoinLastValue, 1)}
            badgeType={stablecoinLastValue > 0 ? 'positive' : 'negative'}
            icon={<div className='bg-success-11 h-8 w-8 rounded-full' />}
          />
        </Card>
        <Card
          isLoading={isLoading}
          className={{ container: 'h-[225px] flex-1' }}
        >
          <ValueMetricField
            className={{
              container: 'gap-10'
            }}
            iconText='ETH Correlated Holdings'
            label='Total ETH Correlated Holdings'
            value={formatPrice(ethCorrelatedHoldingTotalValue)}
            badge={formatPrice(ethCorrelatedHoldingLastValue, 1)}
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
