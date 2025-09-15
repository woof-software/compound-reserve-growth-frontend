import React, { useCallback, useMemo, useReducer } from 'react';

import {
  AnnualisedExpenses,
  annualisedExpensesColumns,
  AnnualisedExpressesPieChart,
  RunwayItem,
  useRunway
} from '@/entities/Runway';
import { useModal } from '@/shared/hooks';
import { formatLargeNumber } from '@/shared/lib/utils';
import { Button, Icon } from '@/shared/ui/atoms';
import { Card } from '@/shared/ui/molecules';
import { SortDrawer } from '@/shared/ui/organisms';

const AnnualisedExpensesBlock = () => {
  const [sortType, setSortType] = useReducer(
    (prev, next) => ({
      ...prev,
      ...next
    }),
    { key: '', type: 'asc' }
  );

  const { data: runwayResponse, isLoading, isError } = useRunway();
  const {
    isOpen: isSortOpen,
    onOpenModal: onSortOpen,
    onCloseModal: onSortClose
  } = useModal();

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  const processedData = useMemo(() => {
    const data = runwayResponse?.data || [];

    const initialResult = {
      tableData: [],
      footerData: { amount: 0, value: 0 },
      pieData: [],
      calculationYear: currentYear
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

      const currentYearStart = new Date(currentYear, 0, 1);
      const currentYearEnd = new Date(currentYear, 11, 31);

      const effectiveStart = new Date(
        Math.max(startDate.getTime(), currentYearStart.getTime())
      );
      const effectiveEnd = new Date(
        Math.min(endDate.getTime(), currentYearEnd.getTime())
      );

      const currentYearDurationMs =
        effectiveEnd.getTime() - effectiveStart.getTime();
      const currentYearDurationDays =
        currentYearDurationMs / (1000 * 60 * 60 * 24);

      if (currentYearDurationDays <= 0) {
        return;
      }

      const totalDurationMs = endDate.getTime() - startDate.getTime();
      const totalDurationDays = totalDurationMs / (1000 * 60 * 60 * 24);

      const dailyValue = item.value / totalDurationDays;
      const dailyAmount = item.amount / totalDurationDays;

      const currentYearValue = dailyValue * currentYearDurationDays;
      const currentYearAmount = dailyAmount * currentYearDurationDays;

      const groupKey = `${item.discipline}__${item.token}`;
      if (!expensesByGroup[groupKey]) {
        expensesByGroup[groupKey] = {
          discipline: item.discipline,
          token: item.token,
          amount: 0,
          value: 0
        };
      }

      expensesByGroup[groupKey].amount += currentYearAmount;
      expensesByGroup[groupKey].value += currentYearValue;

      expensesByDisciplineForPie[item.discipline] =
        (expensesByDisciplineForPie[item.discipline] || 0) + currentYearValue;
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

    return {
      tableData,
      footerData,
      pieData,
      calculationYear: currentYear
    };
  }, [runwayResponse, currentYear]);

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
      title='Annualised Expenses'
      id='Annualised Expenses'
      isLoading={isLoading}
      isError={isError}
      className={{
        loading: 'min-h-[571px]',
        content: 'p-0 lg:p-10',
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
          columns={annualisedExpensesColumns}
          onClose={onSortClose}
          onKeySelect={onKeySelect}
          onTypeSelect={onTypeSelect}
        />
      </div>
      <div className='flex flex-col-reverse justify-between gap-8 lg:flex-row lg:gap-10'>
        <AnnualisedExpenses
          sortType={sortType}
          data={processedData.tableData}
          footerData={processedData.footerData}
        />
        <AnnualisedExpressesPieChart
          className='max-w-full lg:max-h-[400px] lg:max-w-[336.5px]'
          data={processedData.pieData}
        />
      </div>
    </Card>
  );
};

export { AnnualisedExpensesBlock };
