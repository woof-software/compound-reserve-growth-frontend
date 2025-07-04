import React, { FC, useEffect, useMemo, useState } from 'react';

import PieChart from '@/components/Charts/Pie/Pie';
import RevenueOverviewUSD, {
  TableRowData
} from '@/components/RevenuePageTable/RevenueOverviewUSD';
import { useCompCumulativeRevenue } from '@/shared/hooks/useCompCumulativeRevenuets';
import {
  ChartDataItem,
  formatPrice,
  networkColorMap
} from '@/shared/lib/utils/utils';
import Card from '@/shared/ui/Card/Card';
import { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import Icon from '@/shared/ui/Icon/Icon';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
import Text from '@/shared/ui/Text/Text';

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

const capitalize = (s: string): string => {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};

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

const ROLLING_TABS = ['7D', '30D', '90D', '180D', '365D'] as const;
const TO_DATE_TABS = ['WTD', 'MTD', 'YTD'] as const;
const DATE_TYPE_TABS = ['Rolling', 'To Date'] as const;

type RollingTab = (typeof ROLLING_TABS)[number];
type ToDateTab = (typeof TO_DATE_TABS)[number];
type DateType = (typeof DATE_TYPE_TABS)[number];
type Period = RollingTab | ToDateTab;

const toDateHeaderMap: Record<ToDateTab, string> = {
  WTD: 'Week to Date',
  MTD: 'Month to Date',
  YTD: 'Year to Date'
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
      cell: ({ getValue }) => `$${formatNumber(getValue() as number)}`
    })
  );

  return [
    {
      accessorKey: 'chain',
      header: 'Chain',
      cell: ({ getValue }) => {
        const chainName = getValue() as string;
        return (
          <div className='flex items-center gap-2'>
            <Icon
              name={chainName}
              className='h-5 w-5'
            />
            <Text size='13'>{capitalize(chainName)}</Text>
          </div>
        );
      }
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

const RevenueOverview: FC = () => {
  const [dateType, setDateType] = useState<DateType>('Rolling');
  const [period, setPeriod] = useState<Period>('7D');

  const { data: apiResponse, isLoading, isError } = useCompCumulativeRevenue();

  const rawData: ChartDataItem[] = useMemo(
    () => apiResponse?.data?.data || [],
    [apiResponse]
  );

  const primaryTabs = dateType === 'Rolling' ? ROLLING_TABS : TO_DATE_TABS;

  useEffect(() => {
    if (dateType === 'To Date') {
      setPeriod(TO_DATE_TABS[0]);
    } else {
      setPeriod(ROLLING_TABS[0]);
    }
  }, [dateType]);

  const processedData = useMemo(() => {
    if (!rawData.length) {
      return {
        tableData: [],
        pieData: [],
        tableColumns: [],
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

    const tableData: TableRowData[] = Array.from(tableDataMap.values());
    const tableColumns = createTableColumns(primaryTabs, dateType);

    const footerContent = (
      <tr>
        <td className='text-primary-14 px-[5px] py-[13px] text-left text-[11px]'>
          Total
        </td>
        {primaryTabs.map((p) => (
          <td
            key={p}
            className='text-primary-14 px-[5px] py-[13px] text-left text-[11px]'
          >
            ${formatNumber(totals[p] || 0)}
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
        name,
        value: formatPrice(value, 1),
        percent: Number(rawPercent.toFixed(1)),
        color: networkColorMap[name.toLowerCase()] || '#808080'
      };
    });

    return { tableData, pieData, tableColumns, footerContent };
  }, [rawData, dateType, period, primaryTabs]);

  const handleDateTypeChange = (newType: string) => {
    if (isDateType(newType) && newType !== dateType) {
      setDateType(newType);
    }
  };

  const handlePeriodChange = (newPeriod: string) => {
    if (isPeriod(newPeriod)) {
      setPeriod(newPeriod);
    }
  };

  return (
    <Card
      title='Revenue Overview USD'
      isLoading={isLoading}
      isError={isError}
      className={{
        loading: 'min-h-[inherit]',
        container: 'min-h-[571px]',
        content: 'flex flex-col gap-3 px-10 pt-0 pb-10'
      }}
    >
      <div className='flex justify-end gap-3 px-0 py-3'>
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
      </div>
      <div className='flex items-start justify-between'>
        <RevenueOverviewUSD
          isLoading={isLoading}
          data={processedData.tableData}
          columns={processedData.tableColumns}
          footerContent={processedData.footerContent}
        />
        <PieChart
          className='max-h-[400px] max-w-[336.5px]'
          data={processedData.pieData}
        />
      </div>
    </Card>
  );
};

export default RevenueOverview;
