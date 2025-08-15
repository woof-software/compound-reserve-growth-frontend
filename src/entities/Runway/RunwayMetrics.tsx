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
    const today = new Date();

    const initialMetrics = {
      total: 0,
      provider: 0,
      initiative: 0
    };

    if (!data.length) {
      return initialMetrics;
    }

    let totalAnnualised = 0;
    let providerCurrentTotal = 0;
    let initiativeCurrentTotal = 0;

    data.forEach((item) => {
      if (!item.startDate || !item.endDate) {
        return;
      }

      const startDate = new Date(item.startDate);
      const endDate = new Date(item.endDate);
      const startYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();

      const isActiveInCurrentYear =
        startYear <= currentYear && endYear >= currentYear;

      if (isActiveInCurrentYear) {
        const currentYearStart = new Date(currentYear, 0, 1);
        const currentYearEnd = new Date(currentYear, 11, 31);

        const effectiveStart = new Date(
          Math.max(startDate.getTime(), currentYearStart.getTime())
        );
        const effectiveEnd = new Date(
          Math.min(endDate.getTime(), currentYearEnd.getTime())
        );

        const currentYearDurationMs =
          effectiveEnd.getTime() - effectiveStart.getTime();
        const currentYearDurationDays =
          currentYearDurationMs / (1000 * 60 * 60 * 24);

        if (currentYearDurationDays > 0) {
          const totalDurationMs = endDate.getTime() - startDate.getTime();
          const totalDurationDays = totalDurationMs / (1000 * 60 * 60 * 24);

          const dailyValue = item.value / totalDurationDays;
          const currentYearValue = dailyValue * currentYearDurationDays;

          totalAnnualised += currentYearValue;
        }
      }

      const isCurrentlyActive = startDate <= today && endDate >= today;
      if (isCurrentlyActive) {
        if (item.type === 'provider') {
          providerCurrentTotal += item.value;
        } else if (item.type === 'initiative') {
          initiativeCurrentTotal += item.value;
        }
      }
    });

    return {
      total: totalAnnualised,
      provider: providerCurrentTotal,
      initiative: initiativeCurrentTotal
    };
  }, [runwayResponse]);

  return (
    <div className='flex flex-row flex-wrap gap-0 md:gap-5'>
      <Card
        isLoading={isLoading}
        isError={isError}
        className={{
          loading: 'min-h-[130px] md:min-h-[153px]',
          container:
            'border-background min-w-[343px] flex-1 border md:min-w-auto',
          content: 'p-8'
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
          loading: 'min-h-[130px] md:min-h-[153px]',
          container:
            'border-background min-w-[343px] flex-1 border md:min-w-auto',
          content: 'p-8'
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
          loading: 'min-h-[130px] md:min-h-[153px]',
          container:
            'border-background min-w-[343px] flex-1 border md:min-w-auto',
          content: 'p-8'
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
