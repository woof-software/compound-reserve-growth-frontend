import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState
} from 'react';

import PieChart from '@/components/Charts/Pie/Pie';
import RevenueOverviewUSD, {
  DATE_TYPE_TABS,
  DateType,
  Period,
  PeriodMap,
  ROLLING_TABS,
  TableRowData,
  TO_DATE_TABS,
  toDateHeaderMap,
  ToDateTab
} from '@/components/RevenuePageTable/RevenueOverviewUSD';
import SortDrawer from '@/components/SortDrawer/SortDrawer';
import { useModal } from '@/shared/hooks/useModal';
import { RevenuePageProps } from '@/shared/hooks/useRevenue';
import {
  capitalizeFirstLetter,
  formatPrice,
  formatUSD,
  networkColorMap
} from '@/shared/lib/utils/utils';
import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import Icon from '@/shared/ui/Icon/Icon';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
import Text from '@/shared/ui/Text/Text';

const getStartDateForPeriod = (
  period: string,
  dateType: 'Rolling' | 'To Date'
): Date => {
  const now = new Date();

  if (dateType === 'Rolling') {
    const daysAgo = parseInt(period.replace('D', ''), 10);
    now.setDate(now.getDate() - daysAgo);
    return now;
  }

  switch (period) {
    case 'WTD': {
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      now.setDate(diff);
      break;
    }
    case 'MTD': {
      now.setDate(1);
      break;
    }
    case 'YTD': {
      now.setMonth(0, 1);
      break;
    }
    default:
      break;
  }

  now.setHours(0, 0, 0, 0);
  return now;
};

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

function isDateType(value: string): value is DateType {
  return (DATE_TYPE_TABS as readonly string[]).includes(value);
}

function isPeriod(value: string): value is Period {
  const allPeriods: readonly string[] = [...ROLLING_TABS, ...TO_DATE_TABS];
  return allPeriods.includes(value);
}

const NO_DATA_AVAILABLE = 'No data available';

const RevenueOverview = ({
  revenueData: rawData,
  isLoading,
  isError
}: RevenuePageProps) => {
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

  const primaryTabs = dateType === 'Rolling' ? ROLLING_TABS : TO_DATE_TABS;

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
        <td className='text-primary-14 px-[5px] py-[13px] text-left text-[11px] font-medium'>
          Total
        </td>
        {primaryTabs.map((p) => (
          <td
            key={p}
            className='text-primary-14 px-[5px] py-[13px] text-left text-[11px] font-medium'
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

  const tableKey = `${dateType}-${primaryTabs.join('-')}`;

  const handleDateTypeChange = useCallback(
    (newType: string) => {
      if (isDateType(newType) && newType !== dateType) {
        setDateType(newType);
      }
    },
    [dateType]
  );

  const handlePeriodChange = useCallback((newPeriod: string) => {
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
      id='revenue-overview'
      isLoading={isLoading}
      isError={isError}
      className={{
        loading: 'min-h-[inherit]',
        container: 'border-background min-h-[571px] border',
        content: 'flex flex-col gap-3 px-0 pt-0 pb-0 md:pb-10 lg:px-10'
      }}
    >
      <div className='flex flex-wrap justify-end gap-3 px-5 py-3 lg:px-10'>
        <TabsGroup
          key={dateType}
          tabs={[...primaryTabs]}
          value={period}
          onTabChange={handlePeriodChange}
        />
        <TabsGroup
          tabs={[...DATE_TYPE_TABS]}
          value={dateType}
          onTabChange={handleDateTypeChange}
        />
        <Button
          onClick={onSortOpen}
          className='bg-secondary-27 text-gray-11 shadow-13 flex min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold lg:hidden'
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
        <div className='flex flex-col-reverse items-start justify-between gap-8 lg:flex-row'>
          <RevenueOverviewUSD
            key={tableKey}
            data={processedData.tableData}
            columns={stableTableColumns}
            footerContent={processedData.footerContent}
            dateType={dateType}
            totalFooterData={totalFooterData}
            sortType={sortType}
          />
          <PieChart
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

export default RevenueOverview;
