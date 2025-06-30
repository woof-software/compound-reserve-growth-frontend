import { useMemo } from 'react';

import { formatCurrency, formatGrowth } from '@/shared/lib/utils/utils';
import Card from '@/shared/ui/Card/Card';
import ValueMetricField from '@/shared/ui/ValueMetricField/ValueMetricField';

const RevenueMetrics = () => {
  const fullFiveYearData = useMemo(() => {
    const data = [];
    const startDate = new Date('2020-01-01');
    const endDate = new Date('2025-06-24');
    let baseValue = 50000;

    const quarterMultipliers = [1, 1.1, 0.9, 1.2];
    const dayMultipliers = [1, 1, 1, 1, 1, 0.7, 0.7];

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const quarter = Math.floor(d.getMonth() / 3);
      const dayOfWeek = d.getDay();

      const value = Math.max(
        Math.round(
          baseValue *
            quarterMultipliers[quarter] *
            dayMultipliers[dayOfWeek] *
            (1 + (Math.random() - 0.5) * 0.3)
        ),
        10000
      );

      data.push({
        date: d.toISOString().split('T')[0],
        value
      });

      baseValue *= 1.0003;
    }

    return data;
  }, []);

  const yearlyTotals = useMemo(() => {
    const totals: Record<string, { total: number; growth: number }> = {};

    fullFiveYearData.forEach(({ date, value }) => {
      const year = date.substring(0, 4);
      totals[year] = totals[year] || { total: 0, growth: 0 };
      totals[year].total += value;
    });

    Object.keys(totals)
      .sort()
      .reduce((prevYear, year) => {
        if (prevYear && totals[prevYear]) {
          totals[year].growth =
            (totals[year].total / totals[prevYear].total - 1) * 100;
        }
        return year;
      }, '');

    return totals;
  }, [fullFiveYearData]);

  return (
    <div className='flex flex-row gap-5'>
      {['2021', '2022', '2023', '2024'].map((year) => (
        <Card
          key={year}
          className={{ container: 'flex-1' }}
          title={`${year} Revenue`}
        >
          <div className='flex flex-col gap-8'>
            <ValueMetricField
              value={formatCurrency(yearlyTotals[year]?.total || 0)}
              label='Total Revenue'
            />

            <ValueMetricField
              value={formatGrowth(yearlyTotals[year]?.growth || 0)}
              label='YoY Growth'
            />
          </div>
        </Card>
      ))}
    </div>
  );
};

export default RevenueMetrics;
