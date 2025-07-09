import { useMemo } from 'react';

import { useRunway } from '@/shared/hooks/useRunway';
import { formatPrice } from '@/shared/lib/utils/utils';
import Card from '@/shared/ui/Card/Card';
import ValueMetricField from '@/shared/ui/ValueMetricField/ValueMetricField';

const RunwayMetrics = () => {
  const { data: runwayResponse, isLoading, isError } = useRunway();

  const metrics = useMemo(() => {
    const data = runwayResponse?.data || [];

    const initialMetrics = {
      total: 0,
      provider: 0,
      initiative: 0
    };

    if (!data.length) {
      return initialMetrics;
    }

    return data.reduce(
      (acc, item) => {
        acc.total += item.value;
        if (item.type === 'provider') {
          acc.provider += item.value;
        } else if (item.type === 'initiative') {
          acc.initiative += item.value;
        }
        return acc;
      },
      { total: 0, provider: 0, initiative: 0 }
    );
  }, [runwayResponse]);

  return (
    <div className='flex flex-row gap-5'>
      <Card
        isLoading={isLoading}
        isError={isError}
        className={{
          loading: 'min-h-[153px]',
          container: 'flex-1'
        }}
      >
        <ValueMetricField
          value={formatPrice(metrics.total, 1)}
          label='Total Annualised Expenses'
        />
      </Card>
      <Card
        isLoading={isLoading}
        isError={isError}
        className={{
          loading: 'min-h-[153px]',
          container: 'flex-1'
        }}
      >
        <ValueMetricField
          value={formatPrice(metrics.provider, 1)}
          label='Service Provider Expenses'
        />
      </Card>
      <Card
        isLoading={isLoading}
        isError={isError}
        className={{
          loading: 'min-h-[153px]',
          container: 'flex-1'
        }}
      >
        <ValueMetricField
          value={formatPrice(metrics.initiative, 1)}
          label='DAO Initiatives Expenses'
        />
      </Card>
    </div>
  );
};

export default RunwayMetrics;
