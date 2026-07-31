import { useCallback, useMemo } from 'react';
import { parseAsString, useQueryState } from 'nuqs';

import PieChart from '@/components/Charts/Pie/Pie';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import RevenueOverviewUSD, {
  DATE_TYPE_TABS,
  DateType,
  Period,
  PeriodMap,
  RevenueTableRowData, ROLLING_TABS, TO_DATE_TABS,
  toDateHeaderMap,
  ToDateTab
} from '@/components/RevenuePageTable/RevenueOverviewUSD';
import { RevenueProps } from '@/pages/AccountingPage/AccountingPage';
import { useModal } from '@/shared/hooks/useModal';
import { useSorting } from '@/shared/hooks/useSorting';
import { Format } from '@/shared/lib/utils/format';
import { capitalizeFirstLetter, networkColorMap } from '@/shared/lib/utils/utils';
import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import Icon from '@/shared/ui/Icon/Icon';
import SortDrawer from '@/shared/ui/SortDrawer/SortDrawer';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
import Text from '@/shared/ui/Text/Text';

const NO_DATA_AVAILABLE = 'No data available';

const CHAIN_COLUMN: ExtendedColumnDef<RevenueTableRowData> = {
  accessorKey: 'chain',
  header: 'Chain',
  cell: ({ row }) => (
    <div className='flex items-center gap-3'>
      <Icon name={row.original.chain || 'not-found-icon'} className='h-6 w-6' folder='network' />
      <Text size='13' weight='500'>
        {capitalizeFirstLetter(row.original.chain)}
      </Text>
    </div>
  ),
};

const ALL_PERIODS: readonly string[] = [...ROLLING_TABS, ...TO_DATE_TABS];

function getStartDateForPeriod(period: string, dateType: DateType): Date {
  const now = new Date();

  if (dateType === 'Rolling') {
    now.setDate(now.getDate() - parseInt(period.replace('D', ''), 10));
    return now;
  }

  switch (period) {
    case 'WTD': {
      const dayOfWeek = now.getDay();
      now.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
      break;
    }
    case 'MTD':
      now.setDate(1);
      break;
    case 'YTD':
      now.setMonth(0, 1);
      break;
    default:
      break;
  }

  now.setHours(0, 0, 0, 0);
  return now;
}

function isDateType(value: string): value is DateType {
  return (DATE_TYPE_TABS as readonly string[]).includes(value);
}

function isPeriod(value: string): value is Period {
  return ALL_PERIODS.includes(value);
}

const RevenueOverview = (props: RevenueProps) => {
  const { revenueData: rawData, isLoading, isError } = props;
  const { sortKey, sortDirection, onKeySelect, onTypeSelect } = useSorting<RevenueTableRowData>('asc', null);

  const [dateType, setDateType] = useQueryState('rov-date-type', parseAsString.withDefault('Rolling'));
  const [period, setPeriod] = useQueryState('rov-period', parseAsString.withDefault('7D'));

  const { isOpen: isSortOpen, onOpenModal: onSortOpen, onCloseModal: onSortClose } = useModal();

  const normalizedDateType = isDateType(dateType) ? dateType : 'Rolling';

  const primaryTabs = normalizedDateType === 'Rolling' ? ROLLING_TABS : TO_DATE_TABS;

  const normalizedPeriod = isPeriod(period) && (primaryTabs as readonly string[]).includes(period)
        ? period
        : primaryTabs[0];

  const periodStartTimestamps = useMemo(
    () => Object.fromEntries(
      primaryTabs.map((p) => [p, Math.floor(getStartDateForPeriod(p, normalizedDateType).getTime() / 1000)]),
    ),
    [primaryTabs, normalizedDateType],
  );

  const { tableData, pieData, totals } = useMemo(() => {
    if (!rawData.length) {
      return { tableData: [], pieData: [], totals: null };
    }

    const totals = Object.fromEntries(primaryTabs.map((p) => [p, 0])) as PeriodMap;
    const sumsByNetwork = new Map<string, PeriodMap>();

    for (const network of new Set(rawData.map((item) => item.source.network))) {
      sumsByNetwork.set(network, Object.fromEntries(primaryTabs.map((p) => [p, 0])) as PeriodMap);
    }

    for (const item of rawData) {
      const sums = sumsByNetwork.get(item.source.network);
      if (!sums) continue;

      for (const p of primaryTabs) {
        if (item.date >= periodStartTimestamps[p]) {
          sums[p] += item.value;
        }
      }
    }

    for (const sums of sumsByNetwork.values()) {
      primaryTabs.forEach((p) => {
        totals[p] += sums[p];
      });
    }

    const tableData: RevenueTableRowData[] = [...sumsByNetwork.entries()].map(([chain, sums]) => ({
      chain,
      ...sums,
    }));

    const positivePieData = [...sumsByNetwork.entries()]
      .map(([name, sums]) => ({ name, value: sums[normalizedPeriod] || 0 }))
      .filter(({ value }) => value > 0);

    const totalPieValue = positivePieData.reduce((sum, { value }) => sum + value, 0);

    const pieData = positivePieData.map(({ name, value }) => ({
      name: capitalizeFirstLetter(name),
      value: Format.price(value, 'compact'),
      percent: Number((totalPieValue > 0 ? (value / totalPieValue) * 100 : 0).toFixed(1)),
      color: networkColorMap[name.toLowerCase()] || '#808080',
    }));

    return { tableData, pieData, totals };
  }, [rawData, primaryTabs, periodStartTimestamps, normalizedPeriod]);

  const periodColumnDefs = useMemo(
    () =>
      primaryTabs.map((p) => ({
        accessorKey: p,
        header: normalizedDateType === 'Rolling'
          ? `Rolling ${p.toLowerCase()}`
          : toDateHeaderMap[p as ToDateTab] || p
      })),
    [primaryTabs, normalizedDateType],
  );

  const tableColumns = useMemo<ExtendedColumnDef<RevenueTableRowData>[]>(
    () => [
      CHAIN_COLUMN,
      ...periodColumnDefs.map(
        ({ accessorKey, header }): ExtendedColumnDef<RevenueTableRowData> => ({
          accessorKey,
          header,
          cell: ({ getValue }) => Format.price(getValue<number>(), 'standard'),
        }),
      ),
    ],
    [periodColumnDefs],
  );

  const footerContent = useMemo(() => {
    if (!totals) return null;

    return (
      <tr>
        <td className='text-primary-14 px-1.25 py-3.25 text-left text-[13px] font-medium'>Total</td>
        {primaryTabs.map((p) => (
          <td key={p} className='text-primary-14 px-[5px] py-3.25 text-left text-[13px] font-medium'>
            {Format.price(totals[p] || 0, 'standard')}
          </td>
        ))}
      </tr>
    );
  }, [totals, primaryTabs]);

  const sortColumns = useMemo(
    () => [{ accessorKey: 'chain', header: 'Chain' }, ...periodColumnDefs],
    [periodColumnDefs],
  );

  const handleDateTypeChange = useCallback(
    (newType: string) => {
      if (!isDateType(newType) || newType === normalizedDateType) return;
      setDateType(newType);
      setPeriod(newType === 'To Date' ? TO_DATE_TABS[0] : ROLLING_TABS[0]);
    },
    [normalizedDateType, setDateType, setPeriod],
  );

  const handlePeriodChange = useCallback(
    (newPeriod: string) => {
      if (isPeriod(newPeriod)) setPeriod(newPeriod);
    },
    [setPeriod],
  );

  const hasData = tableData.length > 0;

  return (
    <Card
      title='Revenue Overview USD'
      id='revenue-overview'
      isLoading={isLoading}
      isError={isError}
      className={{
        loading: 'min-h-[inherit]',
        container: 'min-h-[571px] rounded-lg',
        content: 'flex flex-col gap-3 pt-0 pb-0 px-5 lg:px-10 lg:pb-10',
      }}
    >
      <div className='flex flex-col-reverse justify-end gap-2 py-3 sm:flex-row sm:items-center'>
        <div className='w-full sm:w-auto'>
          <TabsGroup
            key={normalizedDateType}
            className={{
              container: 'w-full sm:w-auto',
              list: 'w-full sm:w-auto',
            }}
            tabs={[...primaryTabs]}
            value={normalizedPeriod}
            onTabChange={handlePeriodChange}
            disabled={isLoading}
          />
        </div>
        <div className='flex w-full justify-end gap-2 sm:w-auto'>
          <TabsGroup
            className={{
              container: 'w-full sm:w-auto',
              list: 'w-full sm:w-auto',
            }}
            tabs={[...DATE_TYPE_TABS]}
            value={normalizedDateType}
            onTabChange={handleDateTypeChange}
            disabled={isLoading}
          />
          <Button
            onClick={onSortOpen}
            className='bg-secondary-27 text-gray-11 shadow-13 flex h-9 min-w-32.5 gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold sm:w-auto md:h-8 lg:hidden'
          >
            <Icon name='sort-icon' className='h-3.5 w-3.5' />
            Sort
          </Button>
        </div>
      </div>
      {!isLoading && !isError && !hasData ? (
        <NoDataPlaceholder text={NO_DATA_AVAILABLE} isHideButton />
      ) : (
        <div className='flex flex-col-reverse items-start justify-between gap-8 lg:flex-row'>
          <RevenueOverviewUSD
            key={`${normalizedDateType}-${primaryTabs.join('-')}`}
            data={tableData}
            columns={tableColumns}
            footerContent={footerContent}
            dateType={normalizedDateType}
            totalFooterData={totals}
            sortType={{ type: sortDirection, key: sortKey }}
          />
          <PieChart className='max-h-100 w-full max-w-full lg:max-w-[336.5px]' data={pieData} />
        </div>
      )}
      <SortDrawer
        isOpen={isSortOpen}
        onClose={onSortClose}
        sortType={{ type: sortDirection, key: sortKey }}
        columns={sortColumns}
        onTypeSelect={onTypeSelect}
        onKeySelect={onKeySelect}
      />
    </Card>
  );
};

export default RevenueOverview;
