import React, { useCallback, useEffect, useMemo, useState } from 'react';

import CompoundFeeRevenuebyChainComponent, {
  Interval,
  ProcessedRevenueData as TableData
} from '@/components/RevenuePageTable/CompoundFeeRevenuebyChain';
import SingleDropdown, {
  SingleDrawer
} from '@/components/SingleDropdown/SingleDropdown';
import { useModal } from '@/shared/hooks/useModal';
import { RevenuePageProps } from '@/shared/hooks/useRevenue';
import {
  capitalizeFirstLetter,
  ChartDataItem,
  formatCurrencyValue,
  longMonthNames,
  shortMonthNames
} from '@/shared/lib/utils/utils';
import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import Drawer from '@/shared/ui/Drawer/Drawer';
import { useDropdown } from '@/shared/ui/Dropdown/Dropdown';
import Each from '@/shared/ui/Each/Each';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';
import View from '@/shared/ui/View/View';

import CheckStroke from '@/assets/svg/check-stroke.svg';

export interface ProcessedRevenueData {
  chain: string;
  [key: string]: string | number;
}

export interface View {
  tableData: ProcessedRevenueData[];
  totals: { [key: string]: number };
  columns: ExtendedColumnDef<ProcessedRevenueData>[];
}

export interface PrecomputedViews {
  quarterly: Record<string, View>;
  monthly: Record<string, View>;
  weekly: Record<string, View>;
}

const intervalOptions: Interval[] = ['Quarterly', 'Monthly', 'Weekly'];

const NO_DATA_AVAILABLE = 'No data available';

export function precomputeViews(
  rawData: ChartDataItem[]
): PrecomputedViews | null {
  if (!rawData || rawData.length === 0) {
    return null;
  }

  const aggregated = {
    quarterly: {} as Record<string, Record<string, Record<string, number>>>,
    monthly: {} as Record<string, Record<string, Record<string, number>>>,
    weekly: {} as Record<string, Record<string, Record<string, number>>>
  };

  const allChains = new Set<string>();
  const allPeriods = {
    quarterly: new Set<string>(),
    monthly: new Set<string>(),
    weekly: new Set<string>()
  };

  for (const item of rawData) {
    const chain = capitalizeFirstLetter(item.source.network);
    allChains.add(chain);

    const date = new Date(item.date * 1000);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const value = item.value;

    const quarterPeriod = String(year);
    const quarterKey = `Q${Math.floor(month / 3) + 1}`;
    allPeriods.quarterly.add(quarterPeriod);

    const monthPeriod = `${year} ${month < 6 ? 'Jan-Jun' : 'Jul-Dec'}`;
    const monthKey = shortMonthNames[month];
    allPeriods.monthly.add(monthPeriod);

    const weekPeriod = `${longMonthNames[month]} ${year}`;
    const weekKey = `Week ${Math.ceil(day / 7)}`;
    allPeriods.weekly.add(weekPeriod);

    const updateAggregation = (
      store: Record<string, Record<string, Record<string, number>>>,
      period: string,
      key: string
    ) => {
      store[period] = store[period] || {};
      store[period][chain] = store[period][chain] || {};
      store[period][chain][key] = (store[period][chain][key] || 0) + value;
    };

    updateAggregation(aggregated.quarterly, quarterPeriod, quarterKey);
    updateAggregation(aggregated.monthly, monthPeriod, monthKey);
    updateAggregation(aggregated.weekly, weekPeriod, weekKey);
  }

  const chains = Array.from(allChains).sort();
  const precomputed: PrecomputedViews = {
    quarterly: {},
    monthly: {},
    weekly: {}
  };

  const createView = (
    dataForPeriod: Record<string, Record<string, number>>,
    allKeys: string[]
  ): View => {
    const tableData: ProcessedRevenueData[] = [];
    const totals: { [key: string]: number } = {};

    for (const chain of chains) {
      const row: ProcessedRevenueData = { chain };
      let hasData = false;
      const chainData = dataForPeriod ? dataForPeriod[chain] || {} : {};

      for (const key of allKeys) {
        const val = chainData[key] || 0;
        row[key] = val;
        totals[key] = (totals[key] || 0) + val;
        if (val !== 0) hasData = true;
      }

      if (hasData) {
        tableData.push(row);
      }
    }

    return {
      tableData,
      totals,
      columns: allKeys.map((k) => ({
        accessorKey: k,
        header: k,
        cell: ({ getValue }) => formatCurrencyValue(getValue() as number)
      }))
    };
  };

  for (const period of allPeriods.quarterly) {
    precomputed.quarterly[period] = createView(aggregated.quarterly[period], [
      'Q1',
      'Q2',
      'Q3',
      'Q4'
    ]);
  }

  for (const period of allPeriods.monthly) {
    const months = period.includes('Jan-Jun')
      ? ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN']
      : ['JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    precomputed.monthly[period] = createView(
      aggregated.monthly[period],
      months
    );
  }

  for (const period of allPeriods.weekly) {
    const dataForPeriod = aggregated.weekly[period];
    if (!dataForPeriod) continue;

    const weekKeysSet = new Set<string>();
    for (const chainData of Object.values(dataForPeriod)) {
      for (const key of Object.keys(chainData)) {
        weekKeysSet.add(key);
      }
    }
    const sortedWeekKeys = Array.from(weekKeysSet).sort(
      (a, b) =>
        parseInt(a.replace('Week ', '')) - parseInt(b.replace('Week ', ''))
    );
    precomputed.weekly[period] = createView(dataForPeriod, sortedWeekKeys);
  }

  return precomputed;
}

const generateOptions = (views: PrecomputedViews | null, interval: string) => {
  if (!views) return { label: 'Year', options: [] };
  switch (interval) {
    case 'Quarterly':
      return {
        label: 'Year',
        options: Object.keys(views.quarterly).sort(
          (a, b) => parseInt(b) - parseInt(a)
        )
      };
    case 'Monthly':
      return {
        label: 'Period',
        options: Object.keys(views.monthly).sort((a, b) => {
          const yearA = a.substring(0, 4);
          const yearB = b.substring(0, 4);
          if (yearA !== yearB) return parseInt(yearB) - parseInt(yearA);
          return a.includes('Jan-Jun') ? -1 : 1;
        })
      };
    case 'Weekly':
      return {
        label: 'Month',
        options: Object.keys(views.weekly).sort(
          (a, b) => new Date(b).getTime() - new Date(a).getTime()
        )
      };
    default:
      return { label: 'Period', options: [] };
  }
};

const CompoundFeeRevenueByChain = ({
  revenueData,
  isLoading,
  isError
}: RevenuePageProps) => {
  const intervalDropdown = useDropdown('single');
  const periodDropdown = useDropdown('single');

  const [selectedInterval, setSelectedInterval] = useState<Interval>(
    intervalOptions[0]
  );
  const [selectedPeriod, setSelectedPeriod] = useState<string | undefined>();

  const [sortType, setSortType] = useState<{
    key: string;
    type: string;
  }>({ key: 'chain', type: 'asc' });

  const {
    isOpen: isSortOpen,
    onOpenModal: onSortOpen,
    onCloseModal: onSortClose
  } = useModal();

  const precomputedViews = useMemo(
    () => precomputeViews(revenueData || []),
    [revenueData]
  );

  const dynamicOptions = useMemo(
    () => generateOptions(precomputedViews, selectedInterval),
    [precomputedViews, selectedInterval]
  );

  const currentView = useMemo(() => {
    if (!precomputedViews || !selectedPeriod) {
      return { tableData: [], columns: [], totals: {} };
    }

    const viewData: View | undefined =
      precomputedViews[
        selectedInterval.toLowerCase() as keyof PrecomputedViews
      ]?.[selectedPeriod];

    if (!viewData) {
      return { tableData: [], columns: [], totals: {} };
    }

    const finalColumns: ExtendedColumnDef<TableData>[] = [
      {
        accessorKey: 'chain',
        header: 'Chain',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Icon
              name={(row.original.chain || 'not-found-icon').toLowerCase()}
              className='h-6 w-6'
              folder='network'
            />
            <Text size='13'>{capitalizeFirstLetter(row.original.chain)}</Text>
          </div>
        )
      },
      ...viewData.columns
    ];

    return { ...viewData, columns: finalColumns };
  }, [precomputedViews, selectedInterval, selectedPeriod]);

  const compoundFeeRevenueByCainColumns = useMemo(() => {
    if (!precomputedViews || !selectedPeriod) {
      return [
        {
          accessorKey: 'chain',
          header: 'Chain'
        }
      ];
    }

    const viewData: View | undefined =
      precomputedViews[
        selectedInterval.toLowerCase() as keyof PrecomputedViews
      ]?.[selectedPeriod];

    const columns =
      viewData?.columns?.map((el) => ({
        accessorKey: el.accessorKey,
        header: el.header
      })) || [];

    return [
      {
        accessorKey: 'chain',
        header: 'Chain'
      },
      ...columns
    ];
  }, [precomputedViews, selectedPeriod, selectedInterval]);

  const hasData = currentView.tableData.length > 0;

  const handleIntervalSelect = (newInterval: string) => {
    const newOptions = generateOptions(precomputedViews, newInterval);
    const newDefaultPeriod =
      newOptions.options.length > 0 ? newOptions.options[0] : undefined;

    setSelectedInterval(newInterval as Interval);
    setSelectedPeriod(newDefaultPeriod);
    intervalDropdown.close();
  };

  const handlePeriodSelect = (period: string) => {
    setSelectedPeriod(period);
    periodDropdown.close();
  };

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

  useEffect(() => {
    if (precomputedViews && !selectedPeriod) {
      const initialOptions = generateOptions(
        precomputedViews,
        selectedInterval
      );
      if (initialOptions.options.length > 0) {
        setSelectedPeriod(initialOptions.options[0]);
      }
    }
  }, [precomputedViews, selectedPeriod, selectedInterval]);

  return (
    <Card
      title='Compound Fee Revenue by Chain'
      id='compound-fee-revenue-by-chain'
      isLoading={isLoading}
      isError={isError}
      className={{
        container: 'border-background border',
        loading: 'min-h-[571px]',
        content: 'flex flex-col px-0 pt-0 pb-0 md:gap-3 md:pb-10 lg:px-10'
      }}
    >
      <div className='flex flex-wrap justify-end gap-3 px-5 py-3 md:px-10 lg:px-0'>
        <div className='flex items-center gap-1'>
          <Text
            tag='span'
            size='11'
            weight='600'
            lineHeight='16'
            className='text-primary-14'
          >
            Interval
          </Text>
          <div className='hidden md:block'>
            <SingleDropdown
              options={intervalOptions}
              isOpen={intervalDropdown.isOpen}
              onOpen={intervalDropdown.open}
              onClose={intervalDropdown.close}
              onSelect={handleIntervalSelect}
              selectedValue={selectedInterval}
              triggerContentClassName='p-[5px]'
            />
          </div>
          <div className='block md:hidden'>
            <SingleDrawer
              placeholder='Interval'
              options={intervalOptions}
              isOpen={intervalDropdown.isOpen}
              onOpen={intervalDropdown.open}
              onClose={intervalDropdown.close}
              onSelect={handleIntervalSelect}
              selectedValue={selectedInterval}
              triggerContentClassName='p-[5px]'
            />
          </div>
        </div>
        <div className='flex items-center gap-1'>
          <Text
            tag='span'
            size='11'
            weight='600'
            lineHeight='16'
            className='text-primary-14'
          >
            {dynamicOptions.label}
          </Text>
          <div className='hidden md:block'>
            <SingleDropdown
              options={dynamicOptions.options}
              isOpen={periodDropdown.isOpen}
              onOpen={periodDropdown.open}
              onClose={periodDropdown.close}
              onSelect={handlePeriodSelect}
              selectedValue={selectedPeriod}
              triggerContentClassName='p-[5px]'
            />
          </div>
          <div className='block md:hidden'>
            <SingleDrawer
              placeholder={dynamicOptions.label}
              options={dynamicOptions.options}
              isOpen={periodDropdown.isOpen}
              onOpen={periodDropdown.open}
              onClose={periodDropdown.close}
              onSelect={handlePeriodSelect}
              selectedValue={selectedPeriod}
              triggerContentClassName='p-[5px]'
            />
          </div>
        </div>
        <Button
          onClick={onSortOpen}
          className='bg-secondary-27 text-gray-11 shadow-13 flex min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold md:hidden'
        >
          <Icon
            name='sort-icon'
            className='h-[14px] w-[14px]'
          />
          Sort
        </Button>
      </div>
      {!isLoading && !isError && !hasData ? (
        <div className='flex h-[400px] items-center justify-center'>
          <Text
            size='12'
            className='text-primary-14'
          >
            {NO_DATA_AVAILABLE}
          </Text>
        </div>
      ) : (
        <CompoundFeeRevenuebyChainComponent
          sortType={sortType}
          data={currentView.tableData}
          columns={currentView.columns}
          totals={currentView.totals}
          selectedInterval={selectedInterval}
        />
      )}
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
              data={compoundFeeRevenueByCainColumns}
              render={(el) => (
                <div
                  className='flex items-center justify-between'
                  key={el.accessorKey}
                  onClick={() =>
                    onSortTypeByKeySelect(el.accessorKey as string)
                  }
                >
                  <Text
                    size='14'
                    weight='500'
                    lineHeight='16'
                  >
                    {el.header as string}
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
    </Card>
  );
};

export default CompoundFeeRevenueByChain;
