/*
Calculation logic for the "Current Service Providers" block:
1. Filtering: Takes only expenses of type 'provider' that were active within the last year (365 days from today).
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
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    const providerData = allData.filter((item: RunwayItem) => {
      if (item.type !== 'provider') {
        return false;
      }
      const startDate = new Date(item.startDate);
      const endDate = new Date(item.endDate);

      const isActiveInLastYear = startDate <= today && endDate >= oneYearAgo;
      return isActiveInLastYear;
    });

    if (!providerData.length) {
      return initialResult;
    }

    // Table data: each active contract is a separate row. No grouping.
    const tableData = providerData.map((item) => ({
      provider: item.name,
      iconKey: item.iconKey,
      discipline: item.discipline,
      token: item.token,
      amount: item.amount,
      value: item.value
    }));

    // Footer data: sum of all individual active contracts shown in the table.
    const footerData = providerData.reduce(
      (acc, item) => {
        acc.amount += item.amount;
        acc.value += item.value;
        return acc;
      },
      { amount: 0, value: 0 }
    );

    // Pie chart data: group and sum by provider name.
    const expensesByProviderForPie: Record<string, number> = {};
    providerData.forEach((item) => {
      expensesByProviderForPie[item.name] =
        (expensesByProviderForPie[item.name] || 0) + item.value;
    });

    const totalValueForPie = footerData.value;
    const pieData = Object.entries(expensesByProviderForPie).map(
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
      title='Current Service Providers'
      isLoading={isLoading}
      isError={isError}
      className={{
        loading: 'min-h-[571px]'
      }}
    >
      <div className='flex justify-between gap-10'>
        <PieChart
          className='max-h-[400px] max-w-[336.5px]'
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
