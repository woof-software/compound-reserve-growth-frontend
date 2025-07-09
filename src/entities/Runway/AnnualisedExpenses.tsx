import React, { useMemo } from 'react';

import PieChart from '@/components/Charts/Pie/Pie';
import AnnualisedExpenses from '@/components/RunwayPageTable/AnnualisedExpenses';
import type { RunwayItem } from '@/shared/hooks/useRunway';
import { useRunway } from '@/shared/hooks/useRunway';
import { formatPrice } from '@/shared/lib/utils/utils';
import Card from '@/shared/ui/Card/Card';

const AnnualisedExpensesBlock = () => {
  const { data: runwayResponse, isLoading, isError } = useRunway();

  const processedData = useMemo(() => {
    const data = runwayResponse?.data || [];

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
      const value = item.value;
      const amount = item.amount;

      const groupKey = `${item.discipline}__${item.token}`;
      if (!expensesByGroup[groupKey]) {
        expensesByGroup[groupKey] = {
          discipline: item.discipline,
          token: item.token,
          amount: 0,
          value: 0
        };
      }
      expensesByGroup[groupKey].amount += amount;
      expensesByGroup[groupKey].value += value;

      expensesByDisciplineForPie[item.discipline] =
        (expensesByDisciplineForPie[item.discipline] || 0) + value;
    });

    const tableData = Object.values(expensesByGroup);

    const footerData = tableData.reduce(
      (acc, item) => {
        acc.amount += item.amount;
        acc.value += item.value;
        return acc;
      },
      { amount: 0, value: 0 }
    );

    const totalValueForPie = footerData.value;

    const pieData = Object.entries(expensesByDisciplineForPie).map(
      ([name, value]) => ({
        name,
        value: formatPrice(value, 1),
        percent: totalValueForPie > 0 ? (value / totalValueForPie) * 100 : 0
      })
    );

    return { tableData, footerData, pieData };
  }, [runwayResponse]);

  return (
    <Card
      title='Annualised Expenses'
      isLoading={isLoading}
      isError={isError}
      className={{
        loading: 'min-h-[571px]'
      }}
    >
      <div className='flex justify-between'>
        <div className='flex w-[650px] flex-col gap-5'>
          <AnnualisedExpenses
            data={processedData.tableData}
            footerData={processedData.footerData}
          />
        </div>
        <PieChart
          className='max-h-[400px] max-w-[336.5px]'
          data={processedData.pieData}
        />
      </div>
    </Card>
  );
};

export default AnnualisedExpensesBlock;
