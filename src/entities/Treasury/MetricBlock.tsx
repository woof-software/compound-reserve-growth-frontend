import { memo } from 'react';

import { formatPrice, groupByTypeLast30Days } from '@/shared/lib/utils/utils';
import { TokenData } from '@/shared/types/Treasury/types';
import { AssetType } from '@/shared/types/types';
import Card from '@/shared/ui/Card/Card';
import Icon from '@/shared/ui/Icon/Icon';
import ValueMetricField from '@/shared/ui/ValueMetricField/ValueMetricField';

interface MetricBlockProps {
  isLoading?: boolean;

  data: TokenData[];
}

const mapMetricData = (data: TokenData[]) => {
  const treasuryLast30Data = groupByTypeLast30Days(data, true);

  const nonCompItems = Object.entries(treasuryLast30Data)
    .filter(([type]) => type !== AssetType.COMP)
    .flatMap(([, items]) => items);

  const allItems = Object.values(treasuryLast30Data).flat();

  const getLast = (arr: TokenData[]): number =>
    arr.length === 0 ? 0 : [...arr].sort((a, b) => b.date - a.date)[0].value;

  const sumValues = (arr: TokenData[] = []): number =>
    arr.reduce((acc, item) => acc + item.value, 0);

  const compItems = treasuryLast30Data[AssetType.COMP] ?? [];

  const compTotalValue = sumValues(compItems);
  const compLastValue = getLast(compItems);

  const nonCompTotalValue = sumValues(nonCompItems);
  const nonCompLastValue = getLast(nonCompItems);

  const stablecoinItems = treasuryLast30Data[AssetType.STABLECOIN] ?? [];
  const stablecoinTotalValue = sumValues(stablecoinItems);
  const stablecoinLastValue = getLast(stablecoinItems);

  const ethCorrelatedItems = treasuryLast30Data[AssetType.ETH_CORRELATED] ?? [];
  const ethCorrelatedHoldingTotalValue = sumValues(ethCorrelatedItems);
  const ethCorrelatedHoldingLastValue = getLast(ethCorrelatedItems);

  const totalValue = sumValues(allItems);
  const totalLastValue = getLast(allItems);

  return {
    compTotalValue,
    compLastValue,

    nonCompTotalValue,
    nonCompLastValue,

    stablecoinTotalValue,
    stablecoinLastValue,

    ethCorrelatedHoldingTotalValue,
    ethCorrelatedHoldingLastValue,

    totalValue,
    totalLastValue
  };
};

const MetricBlock = memo(({ data }: MetricBlockProps) => {
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
        <Card className={{ container: 'h-[200px] flex-1' }}>
          <ValueMetricField
            label='Total Treasury Value'
            value={formatPrice(totalValue, 1)}
            badge={formatPrice(totalLastValue, 1)}
            badgeType={totalValue > 0 ? 'positive' : 'negative'}
            icon={
              <Icon
                name='wallet'
                className='h-8 w-8'
              />
            }
          />
        </Card>

        <Card className={{ container: 'h-[200px] flex-1' }}>
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

        <Card className={{ container: 'h-[200px] flex-1' }}>
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
        <Card className={{ container: 'h-[225px] flex-1' }}>
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

        <Card className={{ container: 'h-[225px] flex-1' }}>
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
