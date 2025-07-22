import React, { useMemo } from 'react';

import PieChart from '@/components/Charts/Pie/Pie';
import AnnualisedExpenses from '@/components/RunwayPageTable/AnnualisedExpenses';
import type { RunwayItem } from '@/shared/hooks/useRunway';
import { useRunway } from '@/shared/hooks/useRunway';
import { formatLargeNumber } from '@/shared/lib/utils/utils';
import Card from '@/shared/ui/Card/Card';

const AnnualisedExpensesBlock = () => {
  const { data: runwayResponse, isLoading, isError } = useRunway();

  const processedData = useMemo(() => {
    const data = runwayResponse?.data || [];
    const currentYear = new Date().getFullYear();

    const initialResult = {
      tableData: [],
      footerData: { amount: 0, value: 0 },
      pieData: []
    };

    if (!data.length) {
      return initialResult;
    }

    const expensesByGroup: Record<
      string,
      {
        discipline: string;
        token: string;
        amount: number;
        value: number;
      }
    > = {};

    const expensesByDisciplineForPie: Record<string, number> = {};

    data.forEach((item: RunwayItem) => {
      if (!item.startDate || !item.endDate) {
        return;
      }

      const startDate = new Date(item.startDate);
      const endDate = new Date(item.endDate);
      const startYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();

      const isActiveInCurrentYear =
        startYear <= currentYear && endYear >= currentYear;
      if (!isActiveInCurrentYear) {
        return;
      }

      const durationMs = endDate.getTime() - startDate.getTime();

      const durationDays = durationMs / (1000 * 60 * 60 * 24);

      if (durationDays <= 0) {
        return;
      }

      const annualisedValue = (item.value / durationDays) * 365;
      const annualisedAmount = (item.amount / durationDays) * 365;

      const groupKey = `${item.discipline}__${item.token}`;
      if (!expensesByGroup[groupKey]) {
        expensesByGroup[groupKey] = {
          discipline: item.discipline,
          token: item.token,
          amount: 0,
          value: 0
        };
      }

      expensesByGroup[groupKey].amount += annualisedAmount;
      expensesByGroup[groupKey].value += annualisedValue;

      expensesByDisciplineForPie[item.discipline] =
        (expensesByDisciplineForPie[item.discipline] || 0) + annualisedValue;
    });

    const tableData = Object.values(expensesByGroup);

    tableData.sort((a, b) => b.value - a.value);

    const footerData = tableData.reduce(
      (acc, item) => {
        acc.amount += item.amount;
        acc.value += item.value;
        return acc;
      },
      { amount: 0, value: 0 }
    );

    const totalValueForPie = footerData.value;

    const pieData = Object.entries(expensesByDisciplineForPie)
      .sort(([, valueA], [, valueB]) => valueB - valueA)
      .map(([name, value]) => ({
        name,
        value: formatLargeNumber(value, 2),
        percent: totalValueForPie > 0 ? (value / totalValueForPie) * 100 : 0
      }));

    return { tableData, footerData, pieData };
  }, [runwayResponse]);

  return (
    <Card
      title='Annualised Expenses'
      id='annualised-expenses'
      isLoading={isLoading}
      isError={isError}
      className={{
        loading: 'min-h-[571px]'
      }}
    >
      <div className='flex justify-between gap-10'>
        <AnnualisedExpenses
          data={processedData.tableData}
          footerData={processedData.footerData}
        />
        <PieChart
          className='max-h-[400px] max-w-[336.5px]'
          data={processedData.pieData}
        />
      </div>
    </Card>
  );
};

export default AnnualisedExpensesBlock;
