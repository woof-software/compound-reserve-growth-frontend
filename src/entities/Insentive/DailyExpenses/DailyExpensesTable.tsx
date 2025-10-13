import { NumbersFormatter } from '@/shared/lib/utils/numbersFormatter';
import * as React from 'react';
import { useMemo } from 'react';

import { AddressTooltip } from '@/components/AddressTooltip/AddressTooltip';
import { MobileDataTable } from '@/components/MobileDataTable/MobileDataTable';
import { NormalizedTableData } from '@/entities/Insentive/DailyExpenses/lib/types';
import { SortAdapter } from '@/shared/hooks/useSorting';
import { cn } from '@/shared/lib/classNames/classNames';
import {
  capitalizeFirstLetter,
  defaultExplorer,
  explorers,
  formatLargeNumber,
  formatUSD
} from '@/shared/lib/utils/utils';
import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';

export interface DailyExpensesTableProps {
  tableData: NormalizedTableData[];
  sortType: SortAdapter<NormalizedTableData>;
  activeViewTab: 'COMP' | 'USD';
}

const getDailyColumns = (
  view: 'COMP' | 'USD'
): ExtendedColumnDef<NormalizedTableData>[] => {
  return [
    {
      id: 'network',
      accessorFn: (row) => row.network,
      header: 'Network',
      enableSorting: true,
      cell: ({ row }) => (
        <div className='flex items-center gap-3'>
          <Icon
            name={row.original.network || 'not-found-icon'}
            className='h-6 w-6'
            folder='network'
          />
          <Text
            size='13'
            weight='500'
          >
            {capitalizeFirstLetter(row.original.network)}
          </Text>
        </div>
      )
    },
    {
      id: 'market',
      accessorFn: (row) => row.source,
      header: 'Market',
      enableSorting: true,
      sortingFn: (a, b, id) => {
        const aSource = a.getValue(id) as { market?: string };
        const bSource = b.getValue(id) as { market?: string };

        return String(aSource?.market ?? '').localeCompare(
          String(bSource?.market ?? ''),
          undefined,
          { sensitivity: 'base' }
        );
      },
      cell: ({ row }) => (
        <AddressTooltip
          text={row.original.source.market!}
          address={row.original.source.address}
          chain={row.original.source.network}
        />
      )
    },
    {
      id: 'lendIncentive',
      accessorFn: (row) => row.lendIncentive,
      header: 'Lend Incentive',
      enableSorting: true,
      cell: ({ row }) => (
        <Text size='13'>
          {view === 'USD'
            ? NumbersFormatter.price(row.original.lendIncentive, 'full')
            : NumbersFormatter.universal(row.original.lendIncentive, 'full', 4)}
        </Text>
      )
    },
    {
      id: 'borrowIncentive',
      accessorFn: (row) => row.borrowIncentive,
      header: 'Borrow Incentive',
      enableSorting: true,
      size: 120,
      cell: ({ row }) => (
        <Text size='13'>
          {view === 'USD'
            ? NumbersFormatter.price(row.original.borrowIncentive, 'full')
            : NumbersFormatter.universal(
                row.original.borrowIncentive,
                'full',
                4
              )}
        </Text>
      )
    },
    {
      id: 'total',
      accessorFn: (row) => row.total,
      header: 'Total',
      enableSorting: true,
      align: 'right',
      cell: ({ row }) => (
        <Text
          size='13'
          className={'flex justify-end'}
        >
          {view === 'USD'
            ? NumbersFormatter.price(row.original.total, 'full')
            : NumbersFormatter.universal(row.original.total, 'full', 4)}
        </Text>
      )
    }
  ];
};

const DailyExpensesTable = (props: DailyExpensesTableProps) => {
  const { tableData, sortType, activeViewTab } = props;

  const dailyColumns = getDailyColumns(activeViewTab);

  const mobileTableData = useMemo(() => {
    if (!sortType?.key) {
      return tableData;
    }

    const key = sortType.key as keyof NormalizedTableData;
    return [...tableData].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortType.type === 'asc' ? aVal - bVal : bVal - aVal;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortType.type === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return 0;
    });
  }, [tableData, sortType]);

  return (
    <>
      <MobileDataTable tableData={mobileTableData}>
        {(dataRows) =>
          dataRows.map((row, index) => {
            const explorerUrl =
              (row.source && explorers[row.source.network.toLowerCase()]) ||
              defaultExplorer;

            const fullExplorerLink = `${explorerUrl}${row.source.address}`;

            return (
              <div
                key={`${row.network} + ${row.source.address}`}
                className={cn(
                  'border-secondary-23 grid grid-cols-3 gap-x-10 gap-y-3 border-b p-5 md:gap-x-[63px] md:px-10',
                  {
                    'border-none': dataRows.length - 1 === index
                  }
                )}
              >
                <div className='grid w-full'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14'
                  >
                    Network
                  </Text>
                  <div className='flex items-center gap-1'>
                    <Icon
                      name={row.network.toLowerCase() || 'not-found-icon'}
                      className='h-4 w-4'
                      folder='network'
                    />
                    <Text
                      size='13'
                      lineHeight='21'
                      weight='500'
                      className='truncate'
                    >
                      {capitalizeFirstLetter(row.network)}
                    </Text>
                  </div>
                </div>
                <div className='grid w-full'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14'
                  >
                    Market
                  </Text>
                  <a
                    href={fullExplorerLink}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <Text
                      size='13'
                      lineHeight='21'
                      className='w-fit max-w-[60px] truncate border-b border-dotted border-gray-500'
                    >
                      {row.source.market}
                    </Text>
                  </a>
                </div>
                <div className='grid w-full'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14'
                  >
                    Lend Incentive
                  </Text>
                  <Text
                    size='13'
                    lineHeight='21'
                    className='truncate'
                  >
                    {activeViewTab === 'USD'
                      ? formatUSD(row.lendIncentive, 'compact')
                      : formatLargeNumber(row.lendIncentive, 2)}
                  </Text>
                </div>
                <div className='grid w-full'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14'
                  >
                    Borrow Incentive
                  </Text>
                  <Text
                    size='13'
                    lineHeight='21'
                    className='truncate'
                  >
                    {activeViewTab === 'USD'
                      ? formatUSD(row.borrowIncentive, 'compact')
                      : formatLargeNumber(row.borrowIncentive, 2)}
                  </Text>
                </div>
                <div className='grid w-full'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14'
                  >
                    Total
                  </Text>
                  <Text
                    size='13'
                    lineHeight='21'
                    className='truncate'
                  >
                    {activeViewTab === 'USD'
                      ? formatUSD(row.total, 'compact')
                      : formatLargeNumber(row.total, 2)}
                  </Text>
                </div>
              </div>
            );
          })
        }
      </MobileDataTable>
      <DataTable
        data={tableData}
        columns={dailyColumns}
        enableSorting
        enablePagination={tableData.length > 10}
        pageSize={10}
        containerTableClassName='min-h-[518px]'
        className={cn('hidden flex-col justify-between lg:flex', {
          'min-h-[565px]': tableData.length > 10
        })}
        headerCellClassName='py-[13px] px-[5px]'
        cellClassName='py-3 px-[5px]'
        headerTextClassName='text-primary-14 font-medium'
        paginationClassName='py-0 px-[5px]'
      />
    </>
  );
};

export default DailyExpensesTable;
