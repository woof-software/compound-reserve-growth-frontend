/*
Calculation logic for all three "Annualised Expenses" cards:

1. Filtering: A single filter is applied to all data. Only expenses active within the
   current calendar year (e.g., Jan 1 - Dec 31, 2024) are included in the calculation.
   This filter acts as a gatekeeper for all three cards.

2. Annualisation: For each filtered expense, an "Annualised Value" is calculated.
   This is done by finding its daily USD rate (total value / duration in days) and multiplying it by 365.

3. Aggregation: The calculated "Annualised Value" is then added to the appropriate sum(s):
   - Always added to the 'Total' sum.
   - Added to 'Service Provider' sum if type is 'provider'.
   - Added to 'DAO Initiatives' sum if type is 'initiative'.
*/
import { useMemo } from 'react';

import { useRunway } from '@/shared/hooks/useRunway';
import { formatPrice } from '@/shared/lib/utils/utils';
import Card from '@/shared/ui/Card/Card';
import ValueMetricField from '@/shared/ui/ValueMetricField/ValueMetricField';

const RunwayMetrics = () => {
  const { data: runwayResponse, isLoading, isError } = useRunway();

  const metrics = useMemo(() => {
    const data = runwayResponse?.data || [];
    const currentYear = new Date().getFullYear();

    const initialMetrics = {
      total: 0,
      provider: 0,
      initiative: 0
    };

    if (!data.length) {
      return initialMetrics;
    }

    return data.reduce((acc, item) => {
      const startDate = new Date(item.startDate);
      const endDate = new Date(item.endDate);
      const startYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();

      const isActiveInCurrentYear =
        startYear <= currentYear && endYear >= currentYear;

      if (!isActiveInCurrentYear) {
        return acc;
      }

      const durationMs = endDate.getTime() - startDate.getTime();
      const durationDays = durationMs / (1000 * 60 * 60 * 24) + 1;

      if (durationDays <= 0) {
        return acc;
      }

      const annualisedValue = (item.value / durationDays) * 365;

      acc.total += annualisedValue;
      if (item.type === 'provider') {
        acc.provider += annualisedValue;
      } else if (item.type === 'initiative') {
        acc.initiative += annualisedValue;
      }
      return acc;
    }, initialMetrics);
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
