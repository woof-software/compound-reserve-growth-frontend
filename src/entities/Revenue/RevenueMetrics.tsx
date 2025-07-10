import { useMemo } from 'react';

import { useCompCumulativeRevenue } from '@/shared/hooks/useCompCumulativeRevenue';
import { formatGrowth, formatPrice } from '@/shared/lib/utils/utils';
import Card from '@/shared/ui/Card/Card';
import ValueMetricField from '@/shared/ui/ValueMetricField/ValueMetricField';

const RevenueMetrics = () => {
  const { data: revenueData, isLoading, isError } = useCompCumulativeRevenue();

  const yearlyTotals = useMemo(() => {
    if (!revenueData || revenueData.length === 0) {
      return {};
    }

    const totals: Record<string, { total: number; growth: number | null }> = {};

    revenueData.forEach((item) => {
      const year = new Date(item.date * 1000).getFullYear().toString();
      totals[year] = totals[year] || { total: 0, growth: null };
      totals[year].total += item.value;
    });

    const sortedYears = Object.keys(totals).sort();

    sortedYears.reduce((prevYear, currentYear) => {
      if (prevYear && totals[prevYear] && totals[prevYear].total !== 0) {
        totals[currentYear].growth =
          ((totals[currentYear].total - totals[prevYear].total) /
            Math.abs(totals[prevYear].total)) *
          100;
      }
      return currentYear;
    }, '');

    const currentRealWorldYear = new Date().getFullYear().toString();
    if (totals[currentRealWorldYear]) {
      totals[currentRealWorldYear].growth = null;
    }

    return totals;
  }, [revenueData]);

  const yearsToDisplay =
    !isLoading && !isError
      ? Object.keys(yearlyTotals).sort()
      : Array.from({ length: 4 });

  if (!isLoading && !isError && yearsToDisplay.length === 0) {
    return <div>No data available.</div>;
  }

  return (
    <div className='flex flex-row flex-wrap gap-5'>
      {yearsToDisplay.map((yearOrIndex, index) => {
        const isPlaceholder = isLoading || isError;
        const key = isPlaceholder ? index : (yearOrIndex as string);
        const year = isPlaceholder ? '' : (yearOrIndex as string);
        const yearData = yearlyTotals[year];

        return (
          <Card
            key={key}
            isLoading={isLoading}
            isError={isError}
            className={{
              container: 'min-w-64 flex-1 basis-64',
              loading: 'h-[160px]'
            }}
            title={!isPlaceholder ? `${year} Revenue` : undefined}
          >
            <div className='flex flex-col gap-8'>
              <ValueMetricField
                value={formatPrice(yearData?.total ?? 0, 1)}
                label='Total Revenue'
              />
              <ValueMetricField
                value={
                  yearData?.growth != null ? formatGrowth(yearData.growth) : '-'
                }
                label='YoY Growth'
              />
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default RevenueMetrics;
