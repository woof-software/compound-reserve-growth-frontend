import React, { useCallback, useMemo, useState } from 'react';

import PieChart from '@/components/Charts/Pie/Pie';
import AnnualisedExpenses from '@/components/RunwayPageTable/AnnualisedExpenses';
import { useModal } from '@/shared/hooks/useModal';
import type { RunwayItem } from '@/shared/hooks/useRunway';
import { useRunway } from '@/shared/hooks/useRunway';
import { formatLargeNumber } from '@/shared/lib/utils/utils';
import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import Drawer from '@/shared/ui/Drawer/Drawer';
import Each from '@/shared/ui/Each/Each';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';
import View from '@/shared/ui/View/View';

import CheckStroke from '@/assets/svg/check-stroke.svg';

const useCurrentYear = () => {
  return useMemo(() => new Date().getFullYear(), []);
};

export const annualisedExpensesColumns = [
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

const AnnualisedExpensesBlock = () => {
  const [sortType, setSortType] = useState<{
    key: string;
    type: string;
  }>({ key: 'symbol', type: 'asc' });

  const { data: runwayResponse, isLoading, isError } = useRunway();

  const currentYear = useCurrentYear();

  const {
    isOpen: isSortOpen,
    onOpenModal: onSortOpen,
    onCloseModal: onSortClose
  } = useModal();

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

  const onSortTypeByKeySelect = useCallback(
    (value: string) => {
      setSortType({
        ...sortType,
        key: value
      });
    },
    [sortType]
  );

  const onSortTypeByTypeSelect = useCallback(
    (value: string) => {
      setSortType({
        ...sortType,
        type: value
      });
    },
    [sortType]
  );

  return (
    <Card
      title='Annualised Expenses'
      id='annualised-expenses'
      isLoading={isLoading}
      isError={isError}
      className={{
        loading: 'min-h-[571px]',
        content: 'p-0 lg:p-10',
        container: 'border-background border'
      }}
    >
      <div className='block px-6 py-3 md:hidden'>
        <div className='flex flex-wrap items-center justify-end gap-3'>
          <Button
            onClick={onSortOpen}
            className='bg-secondary-27 outline-secondary-18 text-gray-11 flex min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold outline-[0.25px]'
          >
            <Icon
              name='sort-icon'
              className='h-[14px] w-[14px]'
            />
            Sort
          </Button>
        </div>
        <Drawer
          isOpen={isSortOpen}
          onClose={onSortClose}
        >
          <Text
            size='17'
            weight='700'
            lineHeight='140'
            align='center'
            className='mb-8 w-full'
          >
            Sort
          </Text>
          <div className='grid gap-3'>
            <div className='grid gap-4'>
              <Text
                size='14'
                weight='700'
                lineHeight='140'
                align='center'
                className='w-full'
              >
                Sort type
              </Text>
              <Each
                data={[
                  { type: 'asc', header: 'Ascending' },
                  {
                    type: 'desc',
                    header: 'Descending'
                  }
                ]}
                render={(el) => (
                  <div
                    className='flex items-center justify-between'
                    key={el.type}
                    onClick={() => onSortTypeByTypeSelect(el.type)}
                  >
                    <Text
                      size='14'
                      weight='500'
                      lineHeight='16'
                    >
                      {el.header}
                    </Text>
                    <View.Condition if={el.type === sortType?.type}>
                      <CheckStroke
                        width={16}
                        height={16}
                      />
                    </View.Condition>
                  </div>
                )}
              />
            </div>
            <div className='grid gap-4'>
              <Text
                size='14'
                weight='700'
                lineHeight='140'
                align='center'
                className='w-full'
              >
                Columns
              </Text>
              <Each
                data={annualisedExpensesColumns}
                render={(el) => (
                  <div
                    className='flex items-center justify-between'
                    key={el.accessorKey}
                    onClick={() => onSortTypeByKeySelect(el.accessorKey)}
                  >
                    <Text
                      size='14'
                      weight='500'
                      lineHeight='16'
                    >
                      {el.header}
                    </Text>
                    <View.Condition if={el.accessorKey === sortType?.key}>
                      <CheckStroke
                        width={16}
                        height={16}
                      />
                    </View.Condition>
                  </div>
                )}
              />
            </div>
          </div>
        </Drawer>
      </div>
      <div className='flex flex-col-reverse justify-between gap-0 lg:flex-row lg:gap-10'>
        <AnnualisedExpenses
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

export default AnnualisedExpensesBlock;
