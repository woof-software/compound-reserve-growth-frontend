/*
Calculation logic for the "Current Service Providers" block:
1. Filtering: Takes only expenses of type 'provider' that are currently active (endDate >= today).
2. Table Data: Each active provider contract is displayed as a separate row. There is NO GROUPING OR SUMMATION for the table data.
3. Pie Chart Data: The total values (`item.value`) are grouped and summed by the provider's name to show the total expense per provider.
4. Values Used: The full contract values (`item.value` and `item.amount`) are used, not the annualised equivalents.
*/
import React, { useMemo } from 'react';

import PieChart from '@/components/Charts/Pie/Pie';
import CurrentServiceProviders from '@/components/RunwayPageTable/CurrentServiceProviders';
import type { RunwayItem } from '@/shared/hooks/useRunway';
import { useRunway } from '@/shared/hooks/useRunway';
import { formatPrice } from '@/shared/lib/utils/utils';
import Card from '@/shared/ui/Card/Card';

const CurrentServiceProvidersBlock = () => {
  const { data: runwayResponse, isLoading, isError } = useRunway();

  const processedData = useMemo(() => {
    const allData = runwayResponse?.data || [];
    const initialResult = {
      tableData: [],
      footerData: { amount: 0, value: 0 },
      pieData: []
    };

    if (!allData.length) {
      return initialResult;
    }

    const today = new Date();

    const providerData = allData.filter((item: RunwayItem) => {
      if (item.type !== 'provider') {
        return false;
      }
      const startDate = new Date(item.startDate);
      const endDate = new Date(item.endDate);

      const isCurrentlyActive = startDate <= today && endDate >= today;
      return isCurrentlyActive;
    });

    if (!providerData.length) {
      return initialResult;
    }

    providerData.sort((a, b) => b.value - a.value);

    const tableData = providerData.map((item) => ({
      provider: item.name,
      iconKey: item.iconKey,
      discipline: item.discipline,
      token: item.token,
      amount: item.amount,
      value: item.value
    }));

    const footerData = providerData.reduce(
      (acc, item) => {
        acc.amount += item.amount;
        acc.value += item.value;
        return acc;
      },
      { amount: 0, value: 0 }
    );

    const expensesByProviderForPie: Record<string, number> = {};
    providerData.forEach((item) => {
      expensesByProviderForPie[item.name] =
        (expensesByProviderForPie[item.name] || 0) + item.value;
    });

    const totalValueForPie = footerData.value;
    const pieData = Object.entries(expensesByProviderForPie)
      .sort(([, aValue], [, bValue]) => bValue - aValue)
      .map(([name, value]) => ({
        name,
        value: formatPrice(value, 1),
        percent: totalValueForPie > 0 ? (value / totalValueForPie) * 100 : 0
      }));

    return { tableData, footerData, pieData };
  }, [runwayResponse]);

  return (
    <Card
      title='Current Service Providers'
      id='current-service-providers'
      isLoading={isLoading}
      isError={isError}
      className={{
        loading: 'min-h-[571px]'
      }}
    >
      <div className='tablet:flex-row flex flex-col justify-between gap-10'>
        <PieChart
          className='tablet:max-w-[336.5px] tablet:max-h-[400px] max-w-full'
          data={processedData.pieData}
        />
        <CurrentServiceProviders
          data={processedData.tableData}
          footerData={processedData.footerData}
        />
      </div>
    </Card>
  );
};

export default CurrentServiceProvidersBlock;
