/*
Calculation logic for the "Current Service Providers" block:
1. Filtering: Takes only expenses of type 'provider' that are currently active (endDate >= today).
2. Table Data: Each active provider contract is displayed as a separate row. There is NO GROUPING OR SUMMATION for the table data.
3. Pie Chart Data: The total values (`item.value`) are grouped and summed by the provider's name to show the total expense per provider.
4. Values Used: The full contract values (`item.value` and `item.amount`) are used, not the annualised equivalents.
*/
import React, { useCallback, useMemo, useState } from 'react';

import PieChart from '@/components/Charts/Pie/Pie';
import CurrentServiceProviders from '@/components/RunwayPageTable/CurrentServiceProviders';
import { useModal } from '@/shared/hooks/useModal';
import type { RunwayItem } from '@/shared/hooks/useRunway';
import { useRunway } from '@/shared/hooks/useRunway';
import { formatPrice } from '@/shared/lib/utils/utils';
import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import Drawer from '@/shared/ui/Drawer/Drawer';
import Each from '@/shared/ui/Each/Each';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';
import View from '@/shared/ui/View/View';

import CheckStroke from '@/assets/svg/check-stroke.svg';

export const currentServiceProvidersColumns = [
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
  const [sortType, setSortType] = useState<{
    key: string;
    type: string;
  }>({ key: 'symbol', type: 'asc' });

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
          <div className='grid gap-3 px-2'>
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
                data={currentServiceProvidersColumns}
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
      <div className='flex flex-col justify-between lg:flex-row lg:gap-10'>
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
