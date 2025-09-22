import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState
} from 'react';

import CompoundFeeRevenuebyChainComponent, {
  Interval,
  ProcessedRevenueData as TableData
} from '@/components/RevenuePageTable/CompoundFeeRevenuebyChain';
import { useFilterSyncSingle } from '@/shared/hooks/useFiltersSync';
import { useModal } from '@/shared/hooks/useModal';
import { RevenuePageProps } from '@/shared/hooks/useRevenue';
import { cn } from '@/shared/lib/classNames/classNames';
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
import { Radio } from '@/shared/ui/RadioButton/RadioButton';
import SingleDropdown, {
  SingleDrawer
} from '@/shared/ui/SingleDropdown/SingleDropdown';
import SortDrawer from '@/shared/ui/SortDrawer/SortDrawer';
import Text from '@/shared/ui/Text/Text';
import View from '@/shared/ui/View/View';

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

interface GroupDrawerProps {
  isOpen: boolean;

  onClose: () => void;

  interval: {
    label: string;

    options: Interval[];

    selectedValue: Interval;
  };

  groupDynamic: {
    label: string;

    options: string[];

    selectedValue: string;
  };

  onIntervalSelect: (value: Interval) => void;

  onDynamicSelect: (value: string) => void;
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

  useFilterSyncSingle(
    'compFeeRevenueInterval',
    selectedInterval,
    setSelectedInterval
  );
  useFilterSyncSingle(
    'compFeeRevenuePeriod',
    selectedPeriod,
    setSelectedPeriod
  );

  const [sortType, setSortType] = useReducer(
    (prev, next) => ({
      ...prev,
      ...next
    }),
    { key: '', type: 'asc' }
  );

  const {
    isOpen: isSortOpen,
    onOpenModal: onSortOpen,
    onCloseModal: onSortClose
  } = useModal();

  const {
    isOpen: isGroupByOpen,
    onOpenModal: onGroupByOpen,
    onCloseModal: onGroupByClose
  } = useModal();

  const groupInterval = useMemo(() => {
    return {
      label: 'Interval',
      options: intervalOptions,
      selectedValue: selectedInterval
    };
  }, [selectedInterval]);

  const precomputedViews = useMemo(
    () => precomputeViews(revenueData || []),
    [revenueData]
  );

  const dynamicOptions = useMemo(
    () => generateOptions(precomputedViews, selectedInterval),
    [precomputedViews, selectedInterval]
  );

  const groupDynamic = useMemo(() => {
    return {
      label: dynamicOptions.label,
      options: dynamicOptions.options,
      selectedValue: selectedPeriod || ''
    };
  }, [dynamicOptions, selectedPeriod]);

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
            <Text
              size='13'
              weight='500'
            >
              {capitalizeFirstLetter(row.original.chain)}
            </Text>
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

  const sortColumns = useMemo(() => {
    return compoundFeeRevenueByCainColumns.map((col) => ({
      accessorKey: String(col.accessorKey),
      header: typeof col.header === 'string' ? col.header : ''
    }));
  }, [compoundFeeRevenueByCainColumns]);

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
        content: 'flex flex-col px-0 pt-0 pb-0 md:gap-3 lg:px-10 lg:pb-10'
      }}
    >
      <div className='flex flex-wrap justify-end gap-2 px-5 py-3 md:px-10 lg:px-0'>
        <div className='hidden items-center gap-1 lg:flex'>
          <Text
            tag='span'
            size='11'
            weight='600'
            lineHeight='16'
            className='text-primary-14'
          >
            Interval
          </Text>
          <div className='hidden lg:block'>
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
          <div className='block lg:hidden'>
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
        <div className='hidden items-center gap-1 lg:flex'>
          <Text
            tag='span'
            size='11'
            weight='600'
            lineHeight='16'
            className='text-primary-14'
          >
            {dynamicOptions.label}
          </Text>
          <div className='hidden lg:block'>
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
          <div className='block lg:hidden'>
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
        <div className='flex w-full items-center justify-end gap-2 lg:hidden'>
          <Button
            onClick={onGroupByOpen}
            className='bg-secondary-27 text-gray-11 shadow-13 flex h-9 w-full min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold sm:w-auto md:h-8 lg:hidden'
          >
            <Icon
              name='group-grid'
              className='h-[14px] w-[14px] fill-none'
            />
            Group
          </Button>
          <Button
            onClick={onSortOpen}
            className='bg-secondary-27 text-gray-11 shadow-13 flex h-9 w-full min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold sm:w-auto md:h-8 lg:hidden'
          >
            <Icon
              name='sort-icon'
              className='h-[14px] w-[14px]'
            />
            Sort
          </Button>
        </div>
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
      <SortDrawer
        isOpen={isSortOpen}
        sortType={sortType}
        columns={sortColumns}
        onClose={onSortClose}
        onKeySelect={onKeySelect}
        onTypeSelect={onTypeSelect}
      />
      <GroupDrawer
        isOpen={isGroupByOpen}
        onClose={onGroupByClose}
        interval={groupInterval}
        groupDynamic={groupDynamic}
        onIntervalSelect={handleIntervalSelect}
        onDynamicSelect={handlePeriodSelect}
      />
    </Card>
  );
};

const GroupDrawer = ({
  isOpen,
  interval,
  groupDynamic,
  onIntervalSelect,
  onDynamicSelect,
  onClose
}: GroupDrawerProps) => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const onSelectedFilterClose = useCallback(() => {
    setSelectedKey(null);
  }, []);

  const onSelectFilter = useCallback((selectedFilter: string) => {
    setSelectedKey(selectedFilter);
  }, []);

  const onIntervalSelectClick = useCallback(
    (selectedInterval: Interval) => {
      onIntervalSelect(selectedInterval);

      onClose();

      setSelectedKey(null);
    },
    [onClose, onIntervalSelect]
  );

  const onDynamicSelectClick = useCallback(
    (selectedInterval: string) => {
      onDynamicSelect(selectedInterval);

      onClose();

      setSelectedKey(null);
    },
    [onClose, onDynamicSelect]
  );

  const onDrawerClose = useCallback(() => {
    onClose();

    setSelectedKey(null);
  }, [onClose]);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onDrawerClose}
    >
      <View.Condition if={!Boolean(selectedKey)}>
        <Text
          size='17'
          weight='700'
          lineHeight='140'
          align='center'
          className='mb-5 w-full'
        >
          Group
        </Text>
        <div className='grid gap-3'>
          <div
            className='flex h-[42px] cursor-pointer items-center justify-between px-3 py-2.5'
            onClick={() => onSelectFilter(interval.label)}
          >
            <div className='flex items-center gap-1.5'>
              <Icon
                name='plus'
                className='h-2.5 w-2.5'
                color={cn('primary-14', {
                  'secondary-41': Boolean(interval.selectedValue)
                })}
              />
              <Text
                size='14'
                weight='500'
                className={cn('text-primary-14 text-sm font-medium', {
                  'text-secondary-41': Boolean(interval.selectedValue)
                })}
              >
                {interval.label}
              </Text>
            </div>
          </div>
          <div
            className='flex h-[42px] cursor-pointer items-center justify-between px-3 py-2.5'
            onClick={() => onSelectFilter(groupDynamic.label)}
          >
            <div className='flex items-center gap-1.5'>
              <Icon
                name='plus'
                className='h-2.5 w-2.5'
                color={cn('primary-14', {
                  'secondary-41': Boolean(groupDynamic.selectedValue)
                })}
              />
              <Text
                size='14'
                weight='500'
                className={cn('text-primary-14 text-sm font-medium', {
                  'text-secondary-41': Boolean(groupDynamic.selectedValue)
                })}
              >
                {groupDynamic.label}
              </Text>
            </div>
          </div>
        </div>
      </View.Condition>
      <View.Condition if={Boolean(selectedKey)}>
        <View.Condition if={selectedKey === interval.label}>
          <div className='mb-8 flex items-center'>
            <Button onClick={onSelectedFilterClose}>
              <Icon
                name='arrow-line'
                className='h-6 w-6'
              />
            </Button>
            <Text
              size='17'
              weight='700'
              lineHeight='140'
              align='center'
              className='w-[calc(100%-24px)]'
            >
              {interval.label}
            </Text>
          </div>
          <div className='hide-scrollbar mt-8 max-h-[450px] overflow-y-auto'>
            <Radio.Group
              className='gap-1.5'
              direction='vertical'
              value={interval.selectedValue}
              onChange={(v) => onIntervalSelectClick(v as any)}
            >
              <Each
                data={interval.options}
                render={(option, index) => (
                  <Radio.Item
                    key={index}
                    className={cn('p-3', {
                      'bg-secondary-38 rounded-lg':
                        interval.selectedValue === option
                    })}
                    value={option}
                    label={
                      <Radio.Label
                        className={cn({
                          'text-secondary-28': interval.selectedValue === option
                        })}
                        label={option}
                      />
                    }
                  />
                )}
              />
            </Radio.Group>
          </div>
        </View.Condition>
        <View.Condition if={selectedKey === groupDynamic.label}>
          <div className='mb-8 flex items-center'>
            <Button onClick={onSelectedFilterClose}>
              <Icon
                name='arrow-line'
                className='h-6 w-6'
              />
            </Button>
            <Text
              size='17'
              weight='700'
              lineHeight='140'
              align='center'
              className='w-[calc(100%-24px)]'
            >
              {groupDynamic.label}
            </Text>
          </div>
          <div className='hide-scrollbar mt-8 max-h-[450px] overflow-y-auto'>
            <Radio.Group
              className='gap-1.5'
              direction='vertical'
              value={groupDynamic.selectedValue}
              onChange={(v) => onDynamicSelectClick(v as any)}
            >
              <Each
                data={groupDynamic.options}
                render={(option, index) => (
                  <Radio.Item
                    key={index}
                    className={cn('p-3', {
                      'bg-secondary-38 rounded-lg':
                        groupDynamic.selectedValue === option
                    })}
                    value={option}
                    label={
                      <Radio.Label
                        className={cn({
                          'text-secondary-28':
                            groupDynamic.selectedValue === option
                        })}
                        label={option}
                      />
                    }
                  />
                )}
              />
            </Radio.Group>
          </div>
        </View.Condition>
      </View.Condition>
    </Drawer>
  );
};

export default CompoundFeeRevenueByChain;
