/*
Calculation logic for the "Current Initiatives" block:
1. Filtering: Takes only expenses of type 'initiative' that are currently active (endDate >= today).
2. Table Data: Each active initiative is displayed as a separate row. There is NO GROUPING OR SUMMATION for the table data.
3. Pie Chart Data: The total values (`item.value`) are grouped and summed by the initiative's discipline to show the total expense per discipline.
4. Values Used: The full contract values (`item.value` and `item.amount`) are used, not the annualised equivalents.
*/
import React, { useCallback, useMemo, useReducer } from 'react';

import PieChart from '@/components/Charts/Pie/Pie';
import CurrentInitiatives from '@/components/RunwayPageTable/CurrentInitiatives';
import SortDrawer from '@/components/SortDrawer/SortDrawer';
import { useModal } from '@/shared/hooks/useModal';
import type { RunwayItem } from '@/shared/hooks/useRunway';
import { useRunway } from '@/shared/hooks/useRunway';
import { formatPrice } from '@/shared/lib/utils/utils';
import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import Icon from '@/shared/ui/Icon/Icon';

export const currentInitiativesColumns = [
  {
    accessorKey: 'initiative',
    header: 'Initiative'
  },
  {
    accessorKey: 'discipline',
    header: 'discipline'
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

const CurrentInitiativesBlock = () => {
  const [sortType, setSortType] = useReducer(
    (prev, next) => ({
      ...prev,
      ...next
    }),
    { key: '', type: 'asc' }
  );

  const { data: apiResponse, isLoading, isError } = useRunway();

  const {
    isOpen: isSortOpen,
    onOpenModal: onSortOpen,
    onCloseModal: onSortClose
  } = useModal();

  const processedData = useMemo(() => {
    const data = apiResponse?.data || [];
    const initialResult = {
      tableData: [],
      footerData: { totalValue: 0, totalValueWithBounty: 0 },
      pieData: []
    };

    if (!data.length) {
      return initialResult;
    }

    const today = new Date();

    const initiativeData = data.filter((item: RunwayItem) => {
      if (item.type !== 'initiative') {
        return false;
      }
      const startDate = new Date(item.startDate);
      const endDate = new Date(item.endDate);

      const isCurrentlyActive = startDate <= today && endDate >= today;
      return isCurrentlyActive;
    });

    if (!initiativeData.length) {
      return initialResult;
    }

    initiativeData.sort((a, b) => b.value - a.value);

    const tableData = initiativeData.map((item) => ({
      initiative: item.name,
      discipline: item.discipline,
      token: item.token,
      amount: item.amount,
      value: item.value
    }));

    const totalValue = initiativeData.reduce(
      (sum, item) => sum + item.value,
      0
    );
    const footerData = { totalValue, totalValueWithBounty: totalValue };

    const expensesByDisciplineForPie: Record<string, number> = {};
    initiativeData.forEach((item) => {
      expensesByDisciplineForPie[item.discipline] =
        (expensesByDisciplineForPie[item.discipline] || 0) + item.value;
    });

    const totalValueForPie = footerData.totalValue;
    const pieData = Object.entries(expensesByDisciplineForPie)
      .sort(([, aValue], [, bValue]) => bValue - aValue)
      .map(([name, value]) => ({
        name,
        value: formatPrice(value, 1),
        percent: totalValueForPie > 0 ? (value / totalValueForPie) * 100 : 0
      }));

    return { tableData, footerData, pieData };
  }, [apiResponse]);

  const onKeySelect = useCallback((value: string) => {
    setSortType({
      key: value
    });
  }, []);

  const onTypeSelect = useCallback((value: string) => {
    setSortType({
      type: value
    });
  }, []);

  return (
    <Card
      title='Current Initiatives'
      id='current-initiatives'
      isLoading={isLoading}
      isError={isError}
      className={{
        loading: 'min-h-[571px]',
        content: 'p-0 lg:px-10 lg:py-10',
        container: 'border-background border'
      }}
    >
      <div className='block px-5 py-3 lg:hidden'>
        <div className='flex flex-wrap items-center justify-end gap-3'>
          <Button
            onClick={onSortOpen}
            className='bg-secondary-27 text-gray-11 shadow-13 flex min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold'
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
          columns={currentInitiativesColumns}
          onClose={onSortClose}
          onKeySelect={onKeySelect}
          onTypeSelect={onTypeSelect}
        />
      </div>
      <div className='flex flex-col-reverse justify-between gap-8 lg:flex-row lg:gap-10'>
        <CurrentInitiatives
          sortType={sortType}
          data={processedData.tableData}
          footerData={processedData.footerData}
        />
        <PieChart
          className='max-w-full lg:max-h-[400px] lg:max-w-[336.5px]'
          data={processedData.pieData}
        />
      </div>
    </Card>
  );
};

export default CurrentInitiativesBlock;
