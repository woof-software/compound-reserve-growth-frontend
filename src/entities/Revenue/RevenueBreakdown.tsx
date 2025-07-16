import React, { useEffect, useMemo } from 'react';
import type { CellContext } from '@tanstack/react-table';

import CompoundFeeRevenuebyChainComponent, {
  ProcessedRevenueData as TableData
} from '@/components/RevenuePageTable/CompoundFeeRevenuebyChain';
import SingleDropdown from '@/components/SingleDropdown/SingleDropdown';
import { RevenuePageProps } from '@/shared/hooks/useRevenue';
import {
  capitalizeFirstLetter,
  ChartDataItem,
  formatNumber,
  longMonthNames,
  shortMonthNames
} from '@/shared/lib/utils/utils';
import Card from '@/shared/ui/Card/Card';
import { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import { useDropdown } from '@/shared/ui/Dropdown/Dropdown';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';

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

const intervalOptions = ['Quarterly', 'Monthly', 'Weekly'];

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
        cell: ({ getValue }) => formatNumber(getValue() as number)
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
          return a.includes('Jan-Jun') ? 1 : -1;
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

const RevenueBreakdown = ({
  revenueData,
  isLoading,
  isError
}: RevenuePageProps) => {
  const intervalDropdown = useDropdown('single');
  const periodDropdown = useDropdown('single');

  const selectedInterval = intervalDropdown.selectedValue?.[0] || 'Quarterly';
  const selectedPeriod = periodDropdown.selectedValue?.[0];

  const precomputedViews = useMemo(
    () => precomputeViews(revenueData || []),
    [revenueData]
  );

  const dynamicOptions = useMemo(
    () => generateOptions(precomputedViews, selectedInterval),
    [precomputedViews, selectedInterval]
  );

  useEffect(() => {
    if (dynamicOptions.options.length > 0) {
      if (
        !periodDropdown.selectedValue ||
        !dynamicOptions.options.includes(periodDropdown.selectedValue[0])
      ) {
        periodDropdown.select(dynamicOptions.options[0]);
      }
    }
  }, [dynamicOptions, periodDropdown]);

  const { tableData, columns, totals } = useMemo(() => {
    if (!precomputedViews || !selectedPeriod) {
      return { tableData: [], columns: [], totals: {} };
    }

    const viewData: View | undefined =
      precomputedViews[
        selectedInterval.toLowerCase() as keyof PrecomputedViews
      ]?.[selectedPeriod];

    if (!viewData) return { tableData: [], columns: [], totals: {} };

    const remappedDataColumns = viewData.columns.map((col) => {
      const originalCell = col.cell;
      if (!originalCell) {
        return col;
      }

      return {
        ...col,
        cell: (props: CellContext<TableData, unknown>) => {
          const renderedValue =
            typeof originalCell === 'function'
              ? originalCell(props)
              : originalCell;

          if (
            typeof renderedValue === 'string' &&
            renderedValue.startsWith('$-')
          ) {
            return `-${renderedValue.replace('-', '')}`;
          }
          return renderedValue;
        }
      };
    });

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
      ...remappedDataColumns
    ];

    return { ...viewData, columns: finalColumns };
  }, [precomputedViews, selectedInterval, selectedPeriod]);

  const hasData = tableData.length > 0;
  const noDataMessage = 'No data available';

  return (
    <Card
      title='Revenue Breakdown'
      id='revenue-breakdown'
      isLoading={isLoading}
      isError={isError}
      className={{
        loading: 'min-h-[571px]',
        content: 'flex flex-col gap-3 px-10 pt-0 pb-10'
      }}
    >
      <div className='flex justify-end gap-3 px-0 py-3'>
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
          <SingleDropdown
            options={intervalOptions}
            isOpen={intervalDropdown.open}
            onToggle={intervalDropdown.toggle}
            onClose={intervalDropdown.close}
            onSelect={intervalDropdown.select}
            selectedValue={selectedInterval}
            contentClassName='p-[5px]'
            triggerContentClassName='p-[5px]'
          />
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
          <SingleDropdown
            options={dynamicOptions.options}
            isOpen={periodDropdown.open}
            onToggle={periodDropdown.toggle}
            onClose={periodDropdown.close}
            onSelect={periodDropdown.select}
            selectedValue={periodDropdown.selectedValue?.[0]}
            contentClassName='p-[5px]'
            triggerContentClassName='p-[5px]'
          />
        </div>
      </div>
      {!isLoading && !isError && !hasData ? (
        <div className='flex h-[400px] items-center justify-center'>
          <Text
            size='12'
            className='text-primary-14'
          >
            {noDataMessage}
          </Text>
        </div>
      ) : (
        <CompoundFeeRevenuebyChainComponent
          data={tableData}
          columns={columns}
          totals={totals}
        />
      )}
    </Card>
  );
};

export default RevenueBreakdown;
