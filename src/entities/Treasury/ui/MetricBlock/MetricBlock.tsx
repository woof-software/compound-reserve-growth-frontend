import { memo } from 'react';

import { cn } from '@/shared/lib/classNames';
import { formatPrice } from '@/shared/lib/utils';
import { Icon } from '@/shared/ui/atoms';
import { Card } from '@/shared/ui/molecules';
import { ValueMetricField } from '@/shared/ui/organisms';

import { mapMetricData, MetricBlockProps } from '../../model';

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
              'flex h-auto min-h-auto min-w-[343px] flex-1 items-center rounded-b-none md:min-w-auto',
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
            value={formatPrice(totalValue, 1)}
            badge={formatPrice(totalLastValue, 1)}
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
              'border-secondary-26 flex h-auto min-h-auto min-w-[343px] flex-1 items-center rounded-none border-t-1 border-b-1 md:min-w-auto md:border-none',
              {
                'min-h-[180px]': isLoading
              }
            ),
            content: 'w-full p-5 md:p-10'
          }}
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
          className={{
            container: cn(
              'border-b-secondary-26 flex h-auto min-h-auto min-w-[343px] flex-1 items-center rounded-b-none border-b-1 md:min-w-auto md:border-none',
              {
                'min-h-[180px]': isLoading
              }
            ),
            content: 'w-full p-5 md:p-10'
          }}
        >
          <ValueMetricField
            label='Total Non-Comp Value'
            value={formatPrice(nonCompTotalValue)}
            badge={formatPrice(nonCompLastValue, 1)}
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
              'border-b-secondary-26 flex h-auto min-h-auto min-w-[343px] flex-1 items-center rounded-t-none rounded-b-none border-b-1 md:min-w-auto md:border-none',
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
            value={formatPrice(stablecoinTotalValue)}
            badge={formatPrice(stablecoinLastValue, 1)}
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
              'flex h-auto min-h-auto min-w-[343px] flex-1 items-center rounded-t-none md:min-w-auto',
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

export { MetricBlock };
