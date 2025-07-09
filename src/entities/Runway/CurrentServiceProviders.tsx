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

    const providerData = allData.filter(
      (item: RunwayItem) => item.type === 'provider'
    );

    const initialResult = {
      tableData: [],
      footerData: { amount: 0, value: 0 },
      pieData: []
    };

    if (!providerData.length) {
      return initialResult;
    }

    const providersByGroup: Record<
      string,
      {
        provider: string;
        iconKey: string;
        discipline: string;
        token: string;
        amount: number;
        value: number;
      }
    > = {};

    const expensesByProviderForPie: Record<string, number> = {};

    providerData.forEach((item: RunwayItem) => {
      const groupKey = `${item.name}__${item.discipline}__${item.token}`;
      if (!providersByGroup[groupKey]) {
        providersByGroup[groupKey] = {
          provider: item.name,
          iconKey: item.iconKey,
          discipline: item.discipline,
          token: item.token,
          amount: 0,
          value: 0
        };
      }
      providersByGroup[groupKey].amount += item.amount;
      providersByGroup[groupKey].value += item.value;

      expensesByProviderForPie[item.name] =
        (expensesByProviderForPie[item.name] || 0) + item.value;
    });

    const tableData = Object.values(providersByGroup);

    const footerData = tableData.reduce(
      (acc, item) => {
        acc.amount += item.amount;
        acc.value += item.value;
        return acc;
      },
      { amount: 0, value: 0 }
    );

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
      <div className='flex justify-between'>
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
