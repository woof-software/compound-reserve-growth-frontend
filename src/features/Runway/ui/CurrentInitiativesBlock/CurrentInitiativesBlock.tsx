/*
Calculation logic for the "Current Initiatives" block:
1. Filtering: Takes only expenses of type 'initiative' that are currently active (endDate >= today).
2. Table Data: Each active initiative is displayed as a separate row. There is NO GROUPING OR SUMMATION for the table data.
3. Pie Chart Data: The total values (`item.value`) are grouped and summed by the initiative's discipline to show the total expense per discipline.
4. Values Used: The full contract values (`item.value` and `item.amount`) are used, not the annualised equivalents.
*/
import React, { useCallback, useMemo, useReducer } from 'react';

import {
  currentInitiativesColumns,
  CurrentInitiativesPieChart,
  CurrentInitiativesTable,
  RunwayItem,
  useRunway
} from '@/entities/Runway';
import { useModal } from '@/shared/hooks';
import { formatPrice } from '@/shared/lib/utils/utils';
import { Button, Icon } from '@/shared/ui/atoms';
import { Card } from '@/shared/ui/molecules';
import { SortDrawer } from '@/shared/ui/organisms';

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
      id='Current Initiatives'
      isLoading={isLoading}
      isError={isError}
      className={{
        loading: 'min-h-[571px]',
        content: 'p-0 lg:px-10 lg:py-10',
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
          columns={currentInitiativesColumns}
          onClose={onSortClose}
          onKeySelect={onKeySelect}
          onTypeSelect={onTypeSelect}
        />
      </div>
      <div className='flex flex-col-reverse justify-between gap-8 lg:flex-row lg:gap-10'>
        <CurrentInitiativesTable
          sortType={sortType}
          data={processedData.tableData}
          footerData={processedData.footerData}
        />
        <CurrentInitiativesPieChart
          className='max-w-full lg:max-h-[400px] lg:max-w-[336.5px]'
          data={processedData.pieData}
        />
      </div>
    </Card>
  );
};

export { CurrentInitiativesBlock };
