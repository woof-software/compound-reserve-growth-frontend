import { useMemo, useState } from 'react';
import { parseAsString, useQueryState } from 'nuqs';

import { GroupFilter } from '@/components/Filter/GroupFilter';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import CompoundFeeRevenueByChainTable, {
  Interval,
  ProcessedRevenueData,
} from '@/components/RevenuePageTable/CompoundFeeRevenueByChainTable';
import { useModal } from '@/shared/hooks/useModal';
import { RevenuePageProps } from '@/shared/hooks/useRevenue';
import { SortAccessor, useSorting } from '@/shared/hooks/useSorting';
import { Format } from '@/shared/lib/utils/format';
import { capitalizeFirstLetter, ChartDataItem, longMonthNames, shortMonthNames } from '@/shared/lib/utils/utils';
import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import Drawer from '@/shared/ui/Drawer/Drawer';
import Each from '@/shared/ui/Each/Each';
import Icon from '@/shared/ui/Icon/Icon';
import { Radio } from '@/shared/ui/RadioButton/RadioButton';
import SortDrawer from '@/shared/ui/SortDrawer/SortDrawer';
import Text from '@/shared/ui/Text/Text';

const INTERVAL_OPTIONS: Interval[] = ['Quarterly', 'Monthly', 'Weekly'];
const NO_DATA_AVAILABLE = 'No data available';
const QUARTER_COLUMNS = ['Q1', 'Q2', 'Q3', 'Q4'];
const MONTH_COLUMNS_JAN_JUN = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'];
const MONTH_COLUMNS_JUL_DEC = ['JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const INTERVAL_FILTER_OPTIONS = INTERVAL_OPTIONS.map((value) => ({ label: value, value }));

const VIEW_KEY_BY_INTERVAL: Record<Interval, 'quarterly' | 'monthly' | 'weekly'> = {
  Quarterly: 'quarterly',
  Monthly: 'monthly',
  Weekly: 'weekly',
};

type FilterOption = { label: string; value: string };

type PeriodView = {
  tableData: ProcessedRevenueData[];
  totals: Record<string, number>;
  columns: ExtendedColumnDef<ProcessedRevenueData>[];
};

type PrecomputedViews = {
  quarterly: Record<string, PeriodView>;
  monthly: Record<string, PeriodView>;
  weekly: Record<string, PeriodView>;
};

type GroupDrawerFilter = {
  label: string;
  options: readonly string[];
  selectedValue: string;
  onSelect: (value: string) => void;
};

// period → chain → column → amount
type RevenueStore = Record<string, Record<string, Record<string, number>>>;

const CHAIN_COLUMN: ExtendedColumnDef<ProcessedRevenueData> = {
  accessorKey: 'chain',
  header: 'Chain',
  cell: ({ row }) => (
    <div className='flex items-center gap-3'>
      <Icon name={(row.original.chain || 'not-found-icon').toLowerCase()} className='h-6 w-6' folder='network' />
      <Text size='13' weight='500'>
        {capitalizeFirstLetter(row.original.chain)}
      </Text>
    </div>
  ),
};

const isInterval = (value: string): value is Interval => INTERVAL_OPTIONS.includes(value as Interval);

const precomputeViews = (rawData: ChartDataItem[]): PrecomputedViews | null => {
  if (!rawData.length) return null;

  const revenue = { quarterly: {} as RevenueStore, monthly: {} as RevenueStore, weekly: {} as RevenueStore };
  const chains = new Set<string>();
  const periods = { quarterly: new Set<string>(), monthly: new Set<string>(), weekly: new Set<string>() };

  for (const item of rawData) {
    const chain = capitalizeFirstLetter(item.source.network);
    chains.add(chain);

    const date = new Date(item.date * 1000);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const amount = item.value;

    const yearLabel = String(year);
    const halfYearLabel = `${year} ${month < 6 ? 'Jan-Jun' : 'Jul-Dec'}`;
    const monthLabel = `${longMonthNames[month]} ${year}`;

    periods.quarterly.add(yearLabel);
    periods.monthly.add(halfYearLabel);
    periods.weekly.add(monthLabel);

    const add = (store: RevenueStore, period: string, column: string) => {
      if (!store[period]) store[period] = {};
      if (!store[period][chain]) store[period][chain] = {};
      store[period][chain][column] = (store[period][chain][column] ?? 0) + amount;
    };

    add(revenue.quarterly, yearLabel, `Q${Math.floor(month / 3) + 1}`);
    add(revenue.monthly, halfYearLabel, shortMonthNames[month]);
    add(revenue.weekly, monthLabel, `Week ${Math.ceil(day / 7)}`);
  }

  const sortedChains = [...chains].sort();
  const result: PrecomputedViews = { quarterly: {}, monthly: {}, weekly: {} };

  const buildTable = (periodData: Record<string, Record<string, number>>, columns: string[]): PeriodView => {
    const totals: Record<string, number> = {};
    columns.forEach((column) => {
      totals[column] = 0;
    });

    const tableData: ProcessedRevenueData[] = [];

    for (const chain of sortedChains) {
      const chainValues = periodData[chain] ?? {};
      const row: ProcessedRevenueData = { chain };
      let rowHasValues = false;

      for (const column of columns) {
        const cellValue = chainValues[column] ?? 0;
        row[column] = cellValue;
        totals[column] += cellValue;
        if (cellValue !== 0) rowHasValues = true;
      }

      if (rowHasValues) tableData.push(row);
    }

    return {
      tableData,
      totals,
      columns: columns.map((column) => ({
        accessorKey: column,
        header: column,
        cell: ({ getValue }) => Format.price(getValue() as number, 'standard'),
      })),
    };
  };

  for (const period of periods.quarterly) {
    result.quarterly[period] = buildTable(revenue.quarterly[period], QUARTER_COLUMNS);
  }

  for (const period of periods.monthly) {
    const columns = period.includes('Jan-Jun') ? MONTH_COLUMNS_JAN_JUN : MONTH_COLUMNS_JUL_DEC;
    result.monthly[period] = buildTable(revenue.monthly[period], columns);
  }

  for (const period of periods.weekly) {
    const periodData = revenue.weekly[period];
    if (!periodData) continue;

    const weekColumns = new Set<string>();
    for (const chainValues of Object.values(periodData)) {
      Object.keys(chainValues).forEach((column) => weekColumns.add(column));
    }

    const columns = [...weekColumns].sort((a, b) => Number(a.replace('Week ', '')) - Number(b.replace('Week ', '')));

    result.weekly[period] = buildTable(periodData, columns);
  }

  return result;
};

const getPeriodFilter = (views: PrecomputedViews | null, interval: Interval) => {
  if (!views) return { label: 'Year', options: [] as string[] };

  if (interval === 'Quarterly') {
    return { label: 'Year', options: Object.keys(views.quarterly).sort((a, b) => Number(b) - Number(a)) };
  }

  if (interval === 'Monthly') {
    return {
      label: 'Period',
      options: Object.keys(views.monthly).sort((a, b) => {
        const yearA = a.slice(0, 4);
        const yearB = b.slice(0, 4);
        if (yearA !== yearB) return Number(yearB) - Number(yearA);
        return a.includes('Jan-Jun') ? -1 : 1;
      }),
    };
  }

  return {
    label: 'Month',
    options: Object.keys(views.weekly).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()),
  };
};

const GroupDrawer = ({
  isOpen,
  onClose,
  filters,
}: {
  isOpen: boolean;
  onClose: () => void;
  filters: GroupDrawerFilter[];
}) => {
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const active = filters.find((f) => f.label === activeLabel);

  const closeAll = () => {
    onClose();
    setActiveLabel(null);
  };

  const pick = (value: string) => {
    active?.onSelect(value);
    closeAll();
  };

  return (
    <Drawer isOpen={isOpen} onClose={closeAll}>
      {!active ? (
        <>
          <Text size='17' weight='700' lineHeight='140' align='center' className='mb-5 w-full'>
            Group
          </Text>
          <div className='grid gap-3'>
            {filters.map((filter) => (
              <button
                key={filter.label}
                type='button'
                className='flex h-[42px] cursor-pointer items-center gap-1.5 px-3 py-2.5'
                onClick={() => setActiveLabel(filter.label)}
              >
                <Icon name='plus' className='h-2.5 w-2.5' color='primary-14' />
                <Text size='14' weight='500' className='text-primary-14 text-sm font-medium'>
                  {filter.label}
                </Text>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className='mb-8 flex items-center'>
            <Button onClick={() => setActiveLabel(null)}>
              <Icon name='arrow-line' className='h-6 w-6' />
            </Button>
            <Text size='17' weight='700' lineHeight='140' align='center' className='w-[calc(100%-24px)]'>
              {active.label}
            </Text>
          </div>
          <div className='hide-scrollbar mt-8 max-h-[450px] overflow-y-auto'>
            <Radio.Group
              className='gap-1.5'
              direction='vertical'
              value={active.selectedValue}
              onChange={(v) => pick(String(v))}
            >
              <Each
                data={[...active.options]}
                render={(option) => (
                  <Radio.Item
                    key={option}
                    className={active.selectedValue === option ? 'bg-secondary-38 rounded-lg p-3' : 'p-3'}
                    value={option}
                    label={
                      <Radio.Label
                        className={active.selectedValue === option ? 'text-secondary-28' : undefined}
                        label={option}
                      />
                    }
                  />
                )}
              />
            </Radio.Group>
          </div>
        </>
      )}
    </Drawer>
  );
};

const CompoundFeeRevenueByChain = ({ revenueData, isLoading, isError }: RevenuePageProps) => {
  const [interval, setInterval] = useQueryState('compFeeRevenueInterval', parseAsString);
  const [period, setPeriod] = useQueryState('compFeeRevenuePeriod', parseAsString);

  const { sortDirection, sortKey, onKeySelect, onTypeSelect } = useSorting<ProcessedRevenueData>('asc', null);
  const sortType = { type: sortDirection, key: sortKey };

  const { isOpen: isSortOpen, onOpenModal: onSortOpen, onCloseModal: onSortClose } = useModal();
  const { isOpen: isGroupOpen, onOpenModal: onGroupOpen, onCloseModal: onGroupClose } = useModal();

  const precomputedViews = useMemo(() => precomputeViews(revenueData || []), [revenueData]);

  const selectedInterval: Interval = interval && isInterval(interval) ? interval : INTERVAL_OPTIONS[0];
  const periodOptions = getPeriodFilter(precomputedViews, selectedInterval);
  const selectedPeriod = period && periodOptions.options.includes(period) ? period : (periodOptions.options[0] ?? '');

  const view = precomputedViews?.[VIEW_KEY_BY_INTERVAL[selectedInterval]]?.[selectedPeriod];
  const tableData = view?.tableData ?? [];
  const totals = view?.totals ?? {};
  const tableColumns = view ? [CHAIN_COLUMN, ...view.columns] : [CHAIN_COLUMN];
  const sortColumns: SortAccessor<ProcessedRevenueData>[] = view
    ? tableColumns.map((col) => ({
        accessorKey: String(col.accessorKey),
        header: typeof col.header === 'string' ? col.header : '',
      }))
    : [{ accessorKey: 'chain', header: 'Chain' }];

  const periodFilterOptions = periodOptions.options.map((value) => ({ label: value, value }));
  const selectedIntervalOption =
    INTERVAL_FILTER_OPTIONS.find((option) => option.value === selectedInterval) ?? INTERVAL_FILTER_OPTIONS[0];
  const selectedPeriodOption = periodFilterOptions.find((option) => option.value === selectedPeriod) ??
    periodFilterOptions[0] ?? { label: '', value: '' };

  const handleIntervalSelect = (option: FilterOption) => {
    if (!isInterval(option.value)) return;
    void setInterval(option.value === INTERVAL_OPTIONS[0] ? null : option.value);
    void setPeriod(null);
  };

  const handlePeriodSelect = (option: FilterOption) => {
    const defaultPeriod = periodOptions.options[0];
    void setPeriod(option.value && option.value !== defaultPeriod ? option.value : null);
  };

  const mobileGroupFilters: GroupDrawerFilter[] = [
    {
      label: 'Interval',
      options: INTERVAL_OPTIONS,
      selectedValue: selectedInterval,
      onSelect: (value) => handleIntervalSelect({ label: value, value }),
    },
    {
      label: periodOptions.label,
      options: periodOptions.options,
      selectedValue: selectedPeriod,
      onSelect: (value) => handlePeriodSelect({ label: value, value }),
    },
  ];

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
          value={selectedIntervalOption}
          getKey={(option) => option.value}
          getLabel={(option) => option.label}
          setValue={handleIntervalSelect}
        />
        <GroupFilter
          triggerLabel={periodOptions.label}
          hideMobileTrigger
          options={periodFilterOptions}
          value={selectedPeriodOption}
          getKey={(option) => option.value}
          getLabel={(option) => option.label}
          setValue={handlePeriodSelect}
        />
        <div className='flex w-full items-center justify-end gap-2 lg:hidden'>
          <Button
            onClick={onGroupOpen}
            className='bg-secondary-27 text-gray-11 shadow-13 flex h-9 w-full min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold sm:w-auto md:h-8 lg:hidden'
          >
            <Icon name='group-grid' className='h-[14px] w-[14px] fill-none' />
            Group
          </Button>
          <Button
            onClick={onSortOpen}
            className='bg-secondary-27 text-gray-11 shadow-13 flex h-9 w-full min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold sm:w-auto md:h-8 lg:hidden'
          >
            <Icon name='sort-icon' className='h-[14px] w-[14px]' />
            Sort
          </Button>
        </div>
      </div>
      {!isLoading && !isError && !hasData ? (
        <NoDataPlaceholder text={NO_DATA_AVAILABLE} isHideButton />
      ) : (
        <CompoundFeeRevenueByChainTable
          sortType={sortType}
          data={tableData}
          columns={tableColumns}
          totals={totals}
          selectedInterval={selectedInterval}
        />
      )}
      <SortDrawer
        isOpen={isSortOpen}
        sortType={sortType}
        columns={sortColumns}
        onClose={onSortClose}
        onKeySelect={onKeySelect}
        onTypeSelect={onTypeSelect}
      />
      <GroupDrawer isOpen={isGroupOpen} onClose={onGroupClose} filters={mobileGroupFilters} />
    </Card>
  );
};

export default CompoundFeeRevenueByChain;
