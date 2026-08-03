import { useMemo } from 'react';
import { parseAsString, useQueryState } from 'nuqs';

import { GroupFilter } from '@/components/Filter/GroupFilter';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import CompoundFeeRevenueByChainTable, {
  Interval,
  ProcessedRevenueData,
} from '@/components/RevenuePageTable/CompoundFeeRevenueByChainTable';
import { RevenueProps } from '@/pages/AccountingPage/AccountingPage';
import { useModal } from '@/shared/hooks/useModal';
import { useProcessor } from '@/shared/hooks/useProcessor';
import { SortAccessor, useSorting } from '@/shared/hooks/useSorting';
import { Format } from '@/shared/lib/utils/format';
import { capitalizeFirstLetter, ChartDataItem, longMonthNames, shortMonthNames } from '@/shared/lib/utils/utils';
import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import Icon from '@/shared/ui/Icon/Icon';
import SortDrawer from '@/shared/ui/SortDrawer/SortDrawer';
import Text from '@/shared/ui/Text/Text';

const INTERVAL_OPTIONS: Interval[] = ['Quarterly', 'Monthly', 'Weekly'];
const INTERVAL_FILTER_OPTIONS = INTERVAL_OPTIONS.map((value) => ({ label: value, value }));
const NO_DATA_AVAILABLE = 'No data available';
const QUARTER_COLUMNS = ['Q1', 'Q2', 'Q3', 'Q4'];
const MONTH_COLUMNS_JAN_JUN = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'];
const MONTH_COLUMNS_JUL_DEC = ['JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const PERIOD_FILTER_LABEL: Record<Interval, string> = {
  Quarterly: 'Year',
  Monthly: 'Period',
  Weekly: 'Month',
};

const isInterval = (value: string | null): value is Interval => {
  return !!value && INTERVAL_OPTIONS.includes(value as Interval);
};

const getPeriodLabel = (item: ChartDataItem, interval: Interval): string => {
  const date = new Date(item.date * 1000);
  const year = date.getFullYear();
  const month = date.getMonth();

  if (interval === 'Quarterly') return String(year);
  if (interval === 'Monthly') return `${year} ${month < 6 ? 'Jan-Jun' : 'Jul-Dec'}`;
  return `${longMonthNames[month]} ${year}`;
};

const getColumnLabel = (item: ChartDataItem, interval: Interval): string => {
  const date = new Date(item.date * 1000);

  if (interval === 'Quarterly') return `Q${Math.floor(date.getMonth() / 3) + 1}`;
  if (interval === 'Monthly') return shortMonthNames[date.getMonth()];
  return `Week ${Math.ceil(date.getDate() / 7)}`;
};

const sortPeriodOptions = (options: string[], interval: Interval): string[] => {
  if (interval === 'Quarterly') return options.sort((a, b) => Number(b) - Number(a));

  if (interval === 'Monthly') {
    return options.sort((a, b) => {
      const yearDiff = Number(b.slice(0, 4)) - Number(a.slice(0, 4));
      return yearDiff !== 0 ? yearDiff : a.includes('Jan-Jun') ? -1 : 1;
    });
  }

  return options.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
};

const CHAIN_COLUMN: ExtendedColumnDef<ProcessedRevenueData> = {
  accessorKey: 'chain',
  header: 'Chain',
  cell: ({ row }) => (
    <div className='flex items-center gap-3'>
      <Icon name={(row.original.chain || 'not-found-icon').toLowerCase()} className='h-6 w-6' folder='network' />
      <Text
        size='13'
        weight='500'
      >
        {capitalizeFirstLetter(row.original.chain)}
      </Text>
    </div>
  ),
};

const CompoundFeeRevenueByChain = ({ revenueData, isLoading, isError }: RevenueProps) => {
  const [intervalParam, setIntervalParam] = useQueryState('compFeeRevenueInterval', parseAsString);
  const [periodParam, setPeriodParam] = useQueryState('compFeeRevenuePeriod', parseAsString);

  const interval: Interval = isInterval(intervalParam) ? intervalParam : 'Quarterly';

  const { result: periods } = useProcessor({
    array: revenueData,
    filters: [],
    transformer: () => {
      const buckets: Record<string, Record<string, Record<string, number>>> = {};
      
      return (item: ChartDataItem) => {
        const period = getPeriodLabel(item, interval);
        const chain = capitalizeFirstLetter(item.source.network);
        const column = getColumnLabel(item, interval);
        buckets[period] ??= {};
        buckets[period][chain] ??= {};
        buckets[period][chain][column] = (buckets[period][chain][column] ?? 0) + item.value;
        return buckets;
      };
  }});

  const periodsData = periods ?? {};

  const sortedPeriods = useMemo(
    () => sortPeriodOptions(Object.keys(periodsData), interval),
    [periodsData, interval]
  );

  const selectedPeriod = periodParam && sortedPeriods.includes(periodParam)
    ? periodParam
    : sortedPeriods[0];

  const chainValuesByColumn = periodsData[selectedPeriod] ?? {};

  const columnKeys = useMemo(() => {
    if (interval === 'Quarterly') return QUARTER_COLUMNS;
    if (interval === 'Monthly') return selectedPeriod?.includes('Jan-Jun') ? MONTH_COLUMNS_JAN_JUN : MONTH_COLUMNS_JUL_DEC;

    const weeks = new Set<string>();
    Object.values(chainValuesByColumn).forEach((cols) => Object.keys(cols).forEach((c) => weeks.add(c)));
    return [...weeks].sort((a, b) => Number(a.replace('Week ', '')) - Number(b.replace('Week ', '')));
  }, [interval, selectedPeriod, chainValuesByColumn]);

  const { tableData, totals } = useMemo(() => {
    const totals: Record<string, number> = {};
    columnKeys.forEach((c) => { totals[c] = 0; });

    const rows: ProcessedRevenueData[] = [];

    for (const chain of Object.keys(chainValuesByColumn).sort()) {
      const values = chainValuesByColumn[chain];
      const row: ProcessedRevenueData = { chain };
      let hasValues = false;

      for (const column of columnKeys) {
        const value = values[column] ?? 0;
        row[column] = value;
        totals[column] += value;
        if (value !== 0) hasValues = true;
      }

      if (hasValues) rows.push(row);
    }

    return { tableData: rows, totals };
  }, [chainValuesByColumn, columnKeys]);

  const columns = useMemo(() => [
    CHAIN_COLUMN,
    ...columnKeys.map((column):ExtendedColumnDef<ProcessedRevenueData> => ({
      accessorKey: column,
      header: column,
      cell: ({ getValue }) => Format.price(getValue() as number, 'standard'),
    })),
  ], [columnKeys]);

  const { sortDirection, sortKey, onKeySelect, onTypeSelect } = useSorting<ProcessedRevenueData>('asc', null);
  const sortType = { type: sortDirection, key: sortKey };
  const { isOpen: isSortOpen, onOpenModal: onSortOpen, onCloseModal: onSortClose } = useModal();

  const hasData = tableData.length > 0;

  return (
    <Card
      title='Compound Fee Revenue by Chain'
      id='compound-fee-revenue-by-chain'
      isLoading={isLoading}
      isError={isError}
      className={{
        loading: 'min-h-[inherit]',
        container: 'min-h-[571px] rounded-lg',
        content: 'flex flex-col gap-3 pt-0 pb-0 px-5 lg:px-10 lg:pb-10',
      }}
    >
      <div className='flex flex-col-reverse justify-end gap-2 py-3 sm:flex-row sm:items-center'>
        <GroupFilter
          triggerLabel='Interval'
          hideMobileTrigger
          options={INTERVAL_FILTER_OPTIONS}
          value={{ label: interval, value: interval }}
          getKey={(o) => o.value}
          getLabel={(o) => o.label}
          setValue={({ value }) => {
            setIntervalParam(value);
            setPeriodParam(null);
          }}
        />
        <GroupFilter
          triggerLabel={PERIOD_FILTER_LABEL[interval]}
          hideMobileTrigger
          options={sortedPeriods.map((value) => ({ label: value, value }))}
          value={{ label: selectedPeriod ?? '', value: selectedPeriod ?? '' }}
          getKey={(o) => o.value}
          getLabel={(o) => o.label}
          setValue={({ value }) => setPeriodParam(value)}
        />
      </div>
      <div className='flex w-full items-center justify-end gap-2 lg:hidden'>
        <Button
          onClick={onSortOpen}
          className='bg-secondary-27 text-gray-11 shadow-13 flex h-9 w-full min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold sm:w-auto md:h-8 lg:hidden'
        >
          <Icon name='sort-icon' className='h-[14px] w-[14px]' />
          Sort
        </Button>
      </div>
      {!hasData ? (
        <NoDataPlaceholder text={NO_DATA_AVAILABLE} isHideButton />
      ) : (
        <CompoundFeeRevenueByChainTable
          sortType={sortType}
          data={tableData}
          columns={columns}
          totals={totals}
          selectedInterval={interval}
        />
      )}
      <SortDrawer
        isOpen={isSortOpen}
        sortType={sortType}
        columns={columns as SortAccessor<ProcessedRevenueData>[]}
        onClose={onSortClose}
        onKeySelect={onKeySelect}
        onTypeSelect={onTypeSelect}
      />
    </Card>
  );
};

export default CompoundFeeRevenueByChain;