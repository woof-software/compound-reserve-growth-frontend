import * as React from 'react';
import { useMemo } from 'react';

import { AddressTooltip } from '@/components/AddressTooltip/AddressTooltip';
import { MobileDataTable } from '@/components/MobileDataTable/MobileDataTable';
import { NormalizedTableData } from '@/entities/Insentive/DailyExpenses/lib/types';
import { SortAdapter } from '@/shared/hooks/useSorting';
import { cn } from '@/shared/lib/classNames/classNames';
import {
  defaultExplorer,
  explorers,
  formatLargeNumber
} from '@/shared/lib/utils/utils';
import { ClipboardButton } from '@/shared/ui/AnimationProvider/CopyButton/CopyButton';
import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import DrawerInfo from '@/shared/ui/DrawerInfo/DrawerInfo';
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
      size: 168,
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
            {row.original.network}
          </Text>
        </div>
      )
    },
    {
      id: 'market',
      accessorFn: (row) => row.market,
      header: 'Market',
      enableSorting: true,
      cell: ({ row }) => (
        <Text size='13'>
          {row.original.market === 'no market' ? ' - ' : row.original.market}
        </Text>
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
            ? `$${formatLargeNumber(row.original.lendIncentive, 2)}`
            : formatLargeNumber(row.original.lendIncentive, 2)}
        </Text>
      )
    },
    {
      id: 'borrowIncentive',
      accessorFn: (row) => row.borrowIncentive,
      header: 'Borrow Incentive',
      enableSorting: true,
      cell: ({ row }) => (
        <Text size='13'>
          {view === 'USD'
            ? `$${formatLargeNumber(row.original.borrowIncentive, 2)}`
            : formatLargeNumber(row.original.borrowIncentive, 2)}
        </Text>
      )
    },
    {
      id: 'total',
      accessorFn: (row) => row.total,
      header: 'Total',
      enableSorting: true,
      cell: ({ row }) => (
        <Text size='13'>
          {view === 'USD'
            ? `$${formatLargeNumber(row.original.total, 2)}`
            : formatLargeNumber(row.original.total, 2)}
        </Text>
      )
    },
    {
      id: 'source',
      accessorFn: (row) => row.source,
      header: 'Source',
      enableSorting: true,
      align: 'right',
      size: 120,
      cell: ({ row }) => (
        <AddressTooltip
          className={'justify-end'}
          text={row.original.source.market!}
          address={row.original.source.address}
          chain={row.original.source.network}
        />
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
                      className='truncate'
                    >
                      {row.network}
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
                  <Text
                    size='13'
                    lineHeight='21'
                    className='truncate'
                  >
                    {row.market === 'no market' ? ' - ' : row.market}
                  </Text>
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
                      ? `$${formatLargeNumber(row.lendIncentive, 2)}`
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
                      ? `$${formatLargeNumber(row.borrowIncentive, 2)}`
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
                      ? `$${formatLargeNumber(row.total, 2)}`
                      : formatLargeNumber(row.total, 2)}
                  </Text>
                </div>
                <div className='grid w-full'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14'
                  >
                    Source
                  </Text>
                  <DrawerInfo
                    content={
                      <div className='flex w-full flex-col items-start gap-4'>
                        <Text
                          size='17'
                          weight='500'
                          className='text-primary-11 mb-5 w-full !text-center break-all'
                        >
                          {row.source.market}
                        </Text>
                        <div className='flex w-full items-center justify-between'>
                          <Text
                            size='14'
                            className='text-primary-11'
                          >
                            {row.source.address}
                          </Text>
                          <ClipboardButton textToCopy={row.source.address} />
                        </div>
                        <div className='flex w-full items-center justify-between'>
                          <Text
                            size='14'
                            className='text-primary-11'
                          >
                            View on Explorer
                          </Text>
                          <a
                            href={fullExplorerLink}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-primary-11 flex h-5 w-5 items-center justify-center'
                          >
                            <Icon
                              name={'arrow-link'}
                              className='h-4.5 w-3 text-[#7A8A99]'
                            />
                          </a>
                        </div>
                      </div>
                    }
                  >
                    <Text
                      size='13'
                      lineHeight='21'
                      className='w-fit max-w-[60px] truncate border-b border-dotted border-gray-500'
                    >
                      {row.source.market}
                    </Text>
                  </DrawerInfo>
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
