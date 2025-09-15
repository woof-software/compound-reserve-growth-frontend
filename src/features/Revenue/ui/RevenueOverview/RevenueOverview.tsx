import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState
} from 'react';

import {
  DATE_TYPE_TABS,
  DateType,
  getStartDateForPeriod,
  isDateType,
  isPeriod,
  Period,
  PeriodMap,
  RevenueOverviewPieChart,
  RevenueOverviewProps,
  RevenueOverviewTable,
  ROLLING_TABS,
  TableRowData,
  TO_DATE_TABS,
  toDateHeaderMap,
  ToDateTab
} from '@/entities/Revenue';
import { NO_DATA_AVAILABLE } from '@/shared/consts';
import { useModal } from '@/shared/hooks';
import {
  capitalizeFirstLetter,
  formatPrice,
  formatUSD,
  networkColorMap
} from '@/shared/lib/utils/utils';
import { Button, Icon, Text } from '@/shared/ui/atoms';
import { Card, ExtendedColumnDef, TabsGroup } from '@/shared/ui/molecules';
import { SortDrawer } from '@/shared/ui/organisms';

const createTableColumns = (
  periods: readonly string[],
  dateType: 'Rolling' | 'To Date'
): ExtendedColumnDef<TableRowData>[] => {
  const periodColumns: ExtendedColumnDef<TableRowData>[] = periods.map(
    (period) => ({
      accessorKey: period,
      header:
        dateType === 'Rolling'
          ? `Rolling ${period.toLowerCase()}`
          : toDateHeaderMap[period as ToDateTab] || period,
      cell: ({ getValue }) => formatUSD(getValue() as number)
    })
  );

  return [
    {
      accessorKey: 'chain',
      header: 'Chain',
      cell: ({ row }) => (
        <div className='flex items-center gap-3'>
          <Icon
            name={row.original.chain || 'not-found-icon'}
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
    ...periodColumns
  ];
};

const RevenueOverview = ({
  revenueData: rawData,
  isLoading,
  isError
}: RevenueOverviewProps) => {
  const [sortType, setSortType] = useReducer(
    (prev, next) => ({
      ...prev,
      ...next
    }),
    { key: '', type: 'asc' }
  );

  const [dateType, setDateType] = useState<DateType>('Rolling');
  const [period, setPeriod] = useState<Period>('7D');

  const [totalFooterData, setTotalFooterData] = useState<PeriodMap | null>(
    null
  );

  const {
    isOpen: isSortOpen,
    onOpenModal: onSortOpen,
    onCloseModal: onSortClose
  } = useModal();

  const primaryTabs = useMemo(
    () => (dateType === 'Rolling' ? ROLLING_TABS : TO_DATE_TABS),
    [dateType]
  );

  const stableTableColumns = useMemo(() => {
    return createTableColumns(primaryTabs, dateType);
  }, [primaryTabs, dateType]);

  const processedData = useMemo(() => {
    if (!rawData.length) {
      return {
        tableData: [],
        pieData: [],
        footerContent: null
      };
    }

    const tableDataMap = new Map<string, TableRowData>();
    const totals: { [key: string]: number } = {};
    primaryTabs.forEach((p) => (totals[p] = 0));

    const allChains = [...new Set(rawData.map((item) => item.source.network))];
    allChains.forEach((chain) => {
      const initialChainData: TableRowData = { chain };
      primaryTabs.forEach((p) => {
        initialChainData[p] = 0;
      });
      tableDataMap.set(chain, initialChainData);
    });

    primaryTabs.forEach((p) => {
      const startDate = getStartDateForPeriod(p, dateType);
      const startTimestamp = startDate.getTime() / 1000;

      rawData.forEach((item) => {
        if (item.date >= startTimestamp) {
          const chain = item.source.network;
          const chainData = tableDataMap.get(chain);
          if (chainData) {
            (chainData[p] as number) += item.value;
          }
        }
      });
    });

    for (const chainData of tableDataMap.values()) {
      primaryTabs.forEach((p) => {
        totals[p] += chainData[p] as number;
      });
    }

    setTotalFooterData(totals);

    const tableData: TableRowData[] = Array.from(tableDataMap.values());

    const footerContent = (
      <tr>
        <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px] font-medium'>
          Total
        </td>
        {primaryTabs.map((p) => (
          <td
            key={p}
            className='text-primary-14 px-[5px] py-[13px] text-left text-[13px] font-medium'
          >
            {formatUSD(totals[p] || 0)}
          </td>
        ))}
      </tr>
    );

    const positivePieData = tableData
      .map((chainData) => ({
        name: chainData.chain,
        value: (chainData[period] as number) || 0
      }))
      .filter((item) => item.value > 0);

    const totalPieValue = positivePieData.reduce(
      (sum, item) => sum + item.value,
      0
    );

    const pieData = positivePieData.map(({ name, value }) => {
      const rawPercent = totalPieValue > 0 ? (value / totalPieValue) * 100 : 0;
      return {
        name: capitalizeFirstLetter(name),
        value: formatPrice(value, 1),
        percent: Number(rawPercent.toFixed(1)),
        color: networkColorMap[name.toLowerCase()] || '#808080'
      };
    });

    return { tableData, pieData, footerContent };
  }, [rawData, dateType, period, primaryTabs]);

  const revenueOverviewColumns = useMemo(() => {
    const periodColumns = primaryTabs.map((period) => ({
      accessorKey: period,
      header:
        dateType === 'Rolling'
          ? `Rolling ${period.toLowerCase()}`
          : toDateHeaderMap[period as ToDateTab] || period
    }));

    return [
      {
        accessorKey: 'chain',
        header: 'Chain'
      },
      ...periodColumns
    ];
  }, [primaryTabs, dateType]);

  const hasData = processedData.tableData.length > 0;

  const tableKey = useMemo(
    () => `${dateType}-${primaryTabs.join('-')}`,
    [dateType, primaryTabs]
  );

  const onDateTypeChange = useCallback(
    (newType: string) => {
      if (isDateType(newType) && newType !== dateType) {
        setDateType(newType);
      }
    },
    [dateType]
  );

  const onPeriodChange = useCallback((newPeriod: string) => {
    if (isPeriod(newPeriod)) {
      setPeriod(newPeriod);
    }
  }, []);

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
    if (dateType === 'To Date') {
      setPeriod(TO_DATE_TABS[0]);
    } else {
      setPeriod(ROLLING_TABS[0]);
    }
  }, [dateType]);

  return (
    <Card
      title='Revenue Overview USD'
      id='Revenue Overview USD'
      isLoading={isLoading}
      isError={isError}
      className={{
        loading: 'min-h-[inherit]',
        container: 'border-background min-h-[571px] border',
        content: 'flex flex-col gap-3 px-0 pt-0 pb-0 lg:px-10 lg:pb-10'
      }}
    >
      <div className='flex flex-col-reverse justify-end gap-2 px-5 py-3 sm:flex-row lg:px-0'>
        <TabsGroup
          className={{
            list: 'w-full sm:w-auto'
          }}
          key={dateType}
          tabs={[...primaryTabs]}
          value={period}
          onTabChange={onPeriodChange}
        />
        <div className='flex gap-2'>
          <TabsGroup
            className={{
              container: 'w-1/2 sm:w-auto',
              list: 'w-full sm:w-auto'
            }}
            tabs={[...DATE_TYPE_TABS]}
            value={dateType}
            onTabChange={onDateTypeChange}
          />
          <Button
            onClick={onSortOpen}
            className='bg-secondary-27 sm:w-auot text-gray-11 shadow-13 flex h-9 w-1/2 min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold md:h-8 lg:hidden'
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
        <div className='flex flex-col-reverse items-start justify-between gap-8 lg:flex-row'>
          <RevenueOverviewTable
            key={tableKey}
            data={processedData.tableData}
            columns={stableTableColumns}
            footerContent={processedData.footerContent}
            dateType={dateType}
            totalFooterData={totalFooterData}
            sortType={sortType}
          />
          <RevenueOverviewPieChart
            className='max-h-[400px] w-full max-w-full lg:max-w-[336.5px]'
            data={processedData.pieData}
          />
        </div>
      )}
      <SortDrawer
        isOpen={isSortOpen}
        onClose={onSortClose}
        sortType={sortType}
        columns={revenueOverviewColumns}
        onTypeSelect={onTypeSelect}
        onKeySelect={onKeySelect}
      />
    </Card>
  );
};

export { RevenueOverview };
