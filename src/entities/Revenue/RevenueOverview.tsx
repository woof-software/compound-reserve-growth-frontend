import React, { useCallback, useMemo } from 'react';
import { parseAsString, useQueryState } from 'nuqs';

import PieChart from '@/components/Charts/Pie/Pie';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import RevenueOverviewUSD, {
  DATE_TYPE_TABS,
  ROLLING_TABS,
  TO_DATE_TABS,
} from '@/components/RevenuePageTable/RevenueOverviewUSD';
import {
  buildRevenueOverviewData,
  getPeriodHeader,
  getPeriodStartTimestamps,
  isDateType,
  isPeriod,
  resolveOverviewState,
  TABS_CLASS,
} from '@/entities/Revenue/revenueOverviewData';
import { useModal } from '@/shared/hooks/useModal';
import { RevenuePageProps } from '@/shared/hooks/useRevenue';
import { useSorting } from '@/shared/hooks/useSorting';
import { Format } from '@/shared/lib/utils/format';
import { capitalizeFirstLetter } from '@/shared/lib/utils/utils';
import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import Icon from '@/shared/ui/Icon/Icon';
import SortDrawer from '@/shared/ui/SortDrawer/SortDrawer';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
import Text from '@/shared/ui/Text/Text';

import type { RevenueTableRowData } from '@/components/RevenuePageTable/RevenueOverviewUSD';

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

const RevenueOverview = ({ revenueData: rawData, isLoading, isError }: RevenuePageProps) => {
  const { sortKey, sortDirection, onKeySelect, onTypeSelect } = useSorting<RevenueTableRowData>('asc', null);

  const [dateType, setDateType] = useQueryState('rov-date-type', parseAsString.withDefault('Rolling'));
  const [period, setPeriod] = useQueryState('rov-period', parseAsString.withDefault('7D'));

  const { isOpen: isSortOpen, onOpenModal: onSortOpen, onCloseModal: onSortClose } = useModal();

  const { normalizedDateType, primaryTabs, normalizedPeriod } = resolveOverviewState(dateType, period);

  const periodStartTimestamps = useMemo(
    () => getPeriodStartTimestamps(primaryTabs, normalizedDateType),
    [primaryTabs, normalizedDateType],
  );

  const { tableData, pieData, totals } = useMemo(
    () => buildRevenueOverviewData(rawData, primaryTabs, periodStartTimestamps, normalizedPeriod),
    [rawData, primaryTabs, periodStartTimestamps, normalizedPeriod],
  );

  const periodColumnDefs = useMemo(
    () =>
      primaryTabs.map((p) => ({
        accessorKey: p,
        header: getPeriodHeader(p, normalizedDateType),
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
          cell: ({ getValue }) => Format.price(getValue() as number, 'standard'),
        }),
      ),
    ],
    [periodColumnDefs],
  );

  const footerContent = useMemo(() => {
    if (!totals) return null;

    return (
      <tr>
        <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px] font-medium'>Total</td>
        {primaryTabs.map((p) => (
          <td key={p} className='text-primary-14 px-[5px] py-[13px] text-left text-[13px] font-medium'>
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
            className={TABS_CLASS}
            tabs={[...primaryTabs]}
            value={normalizedPeriod}
            onTabChange={handlePeriodChange}
            disabled={isLoading}
          />
        </div>
        <div className='flex w-full justify-end gap-2 sm:w-auto'>
          <TabsGroup
            className={TABS_CLASS}
            tabs={[...DATE_TYPE_TABS]}
            value={normalizedDateType}
            onTabChange={handleDateTypeChange}
            disabled={isLoading}
          />
          <Button
            onClick={onSortOpen}
            className='bg-secondary-27 text-gray-11 shadow-13 flex h-9 min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold sm:w-auto md:h-8 lg:hidden'
          >
            <Icon name='sort-icon' className='h-[14px] w-[14px]' />
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
          <PieChart className='max-h-[400px] w-full max-w-full lg:max-w-[336.5px]' data={pieData} />
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
