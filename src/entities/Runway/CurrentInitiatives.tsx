import React, { useMemo } from 'react';

import PieChart from '@/components/Charts/Pie/Pie';
import CurrentInitiatives from '@/components/RunwayPageTable/CurrentInitiatives';
import type { RunwayItem } from '@/shared/hooks/useRunway';
import { useRunway } from '@/shared/hooks/useRunway';
import { formatPrice } from '@/shared/lib/utils/utils';
import Card from '@/shared/ui/Card/Card';

const CurrentInitiativesBlock = () => {
  const { data: apiResponse, isLoading, isError } = useRunway();

  const processedData = useMemo(() => {
    const data = apiResponse?.data || [];

    const initialResult = {
      tableData: [],
      footerData: { totalValue: 0, totalValueWithBounty: 0 },
      pieData: []
    };

    const initiativeData = data.filter(
      (item: RunwayItem) => item.type === 'initiative'
    );

    if (!initiativeData.length) {
      return initialResult;
    }

    const initiativesByGroup: Record<
      string,
      {
        initiative: string;
        discipline: string;
        token: string;
        amount: number;
        value: number;
      }
    > = {};
    initiativeData.forEach((item) => {
      const groupKey = `${item.name}__${item.discipline}__${item.token}`;
      if (!initiativesByGroup[groupKey]) {
        initiativesByGroup[groupKey] = {
          initiative: item.name,
          discipline: item.discipline,
          token: item.token,
          amount: 0,
          value: 0
        };
      }
      initiativesByGroup[groupKey].amount += item.amount;
      initiativesByGroup[groupKey].value += item.value;
    });

    const tableData = Object.values(initiativesByGroup);

    const totalValue = tableData.reduce((sum, item) => sum + item.value, 0);
    const totalValueWithBounty = totalValue;
    const footerData = { totalValue, totalValueWithBounty };

    const expensesByDisciplineForPie: Record<string, number> = {};
    tableData.forEach((item) => {
      expensesByDisciplineForPie[item.discipline] =
        (expensesByDisciplineForPie[item.discipline] || 0) + item.value;
    });

    const totalValueForPie = footerData.totalValue;

    const pieData = Object.entries(expensesByDisciplineForPie).map(
      ([name, value]) => ({
        name,
        value: formatPrice(value, 1),
        percent: totalValueForPie > 0 ? (value / totalValueForPie) * 100 : 0
      })
    );

    return { tableData, footerData, pieData };
  }, [apiResponse]);

  return (
    <Card
      title='Current Initiatives'
      isLoading={isLoading}
      isError={isError}
      className={{
        loading: 'min-h-[571px]'
      }}
    >
      <div className='flex justify-between'>
        <CurrentInitiatives
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

export default CurrentInitiativesBlock;
