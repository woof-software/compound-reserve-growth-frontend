/*
Calculation logic for the "Current Service Providers" block:
1. Filtering: Takes only expenses of type 'provider' that are currently active (endDate >= today).
2. Table Data: Each active provider contract is displayed as a separate row. There is NO GROUPING OR SUMMATION for the table data.
3. Pie Chart Data: The total values (`item.value`) are grouped and summed by the provider's name to show the total expense per provider.
4. Values Used: The full contract values (`item.value` and `item.amount`) are used, not the annualised equivalents.
*/
import { Format } from '@/shared/lib/utils/numbersFormatter';
import React, { useMemo } from 'react';

import PieChart from '@/components/Charts/Pie/Pie';
import CurrentServiceProviders from '@/components/RunwayPageTable/CurrentServiceProviders';
import { useModal } from '@/shared/hooks/useModal';
import type { RunwayItem } from '@/shared/hooks/useRunway';
import { useRunway } from '@/shared/hooks/useRunway';
import {
  SortAccessor,
  SortAdapter,
  useSorting
} from '@/shared/hooks/useSorting';
import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import Icon from '@/shared/ui/Icon/Icon';
import SortDrawer from '@/shared/ui/SortDrawer/SortDrawer';

export type RunawayServiceProviderRecord = {
  provider: string;
  iconKey: string;
  discipline: string;
  token: string;
  amount: number;
  value: number;
};

export const currentServiceProvidersColumns: SortAccessor<RunawayServiceProviderRecord>[] =
  [
    {
      accessorKey: 'provider',
      header: 'Provider'
    },
    {
      accessorKey: 'discipline',
      header: 'Discipline'
    },
    {
      accessorKey: 'token',
      header: 'Token'
    },
    {
      accessorKey: 'amount',
      header: 'Amount (Qty)'
    },
    {
      accessorKey: 'value',
      header: 'Value ($)'
    }
  ];

const CurrentServiceProvidersBlock = () => {
  const { sortDirection, sortKey, onKeySelect, onTypeSelect } =
    useSorting<RunawayServiceProviderRecord>('asc', null);

  const sortType: SortAdapter<RunawayServiceProviderRecord> = {
    type: sortDirection,
    key: sortKey
  };

  const {
    isOpen: isSortOpen,
    onOpenModal: onSortOpen,
    onCloseModal: onSortClose
  } = useModal();

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

    const tableData = providerData.map(
      (item) =>
        ({
          provider: item.name,
          iconKey: item.iconKey,
          discipline: item.discipline,
          token: item.token,
          amount: item.amount,
          value: item.value
        }) satisfies RunawayServiceProviderRecord
    );

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
        value: Format.price(value, 'compact'),
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
        loading: 'min-h-[571px]',
        content: 'px-0 py-0 lg:px-10 lg:py-10',
        container: 'border-background border'
      }}
    >
      <div className='block px-5 py-3 lg:hidden'>
        <div className='flex flex-wrap items-center justify-end gap-2'>
          <Button
            onClick={onSortOpen}
            className='bg-secondary-27 text-gray-11 shadow-13 flex h-9 min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold md:h-8'
          >
            <Icon
              name='sort-icon'
              className='h-[14px] w-[14px]'
            />
            Sort
          </Button>
        </div>
        <SortDrawer
          isOpen={isSortOpen}
          sortType={sortType}
          columns={currentServiceProvidersColumns}
          onClose={onSortClose}
          onKeySelect={onKeySelect}
          onTypeSelect={onTypeSelect}
        />
      </div>
      <div className='flex flex-col justify-between gap-8 lg:flex-row lg:gap-10'>
        <PieChart
          className='max-w-full lg:max-h-[400px] lg:max-w-[336.5px]'
          data={processedData.pieData}
        />
        <CurrentServiceProviders
          sortType={sortType}
          data={processedData.tableData}
          footerData={processedData.footerData}
        />
      </div>
    </Card>
  );
};

export default CurrentServiceProvidersBlock;
