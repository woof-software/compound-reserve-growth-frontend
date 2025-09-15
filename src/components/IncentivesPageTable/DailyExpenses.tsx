import * as React from 'react';
import { useMemo } from 'react';

import { MobileDataTable } from '@/components/MobileDataTable/MobileDataTable';
import { cn } from '@/shared/lib/classNames/classNames';
import {
  defaultExplorer,
  explorers,
  formatLargeNumber,
  formatPrice,
  sliceAddress
} from '@/shared/lib/utils/utils';
import { ClipboardButton } from '@/shared/ui/AnimationProvider/CopyButton/CopyButton';
import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import DrawerInfo from '@/shared/ui/DrawerInfo/DrawerInfo';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';

import { AddressTooltip } from '../AddressTooltip/AddressTooltip';

export type TreasuryBalanceByNetworkType = {
  symbol: string;
  chain: string;
  market: string | null;
  qty: number;
  value: number;
  price: number;
  source: string;
  address: string;
};

export interface TreasuryHoldingsProps {
  tableData: TreasuryBalanceByNetworkType[];

  sortType: { key: string; type: string };
}

const treasuryColumns: ExtendedColumnDef<TreasuryBalanceByNetworkType>[] = [
  {
    id: 'symbol',
    accessorFn: (row) => row.symbol,
    header: 'Network',
    enableSorting: true,
    size: 168,
    cell: ({ row }) => (
      <div className='flex items-center gap-3'>
        <Icon
          name={row.original.symbol || 'not-found-icon'}
          className='h-6 w-6'
          folder='collaterals'
        />
        <Text
          size='13'
          weight='500'
        >
          {row.original.symbol}
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
    id: 'qty',
    accessorFn: (row) => row.qty,
    header: 'Lend Incentive',
    enableSorting: true,
    cell: ({ row }) => (
      <Text size='13'>{formatLargeNumber(row.original.qty, 1)}</Text>
    )
  },
  {
    id: 'value',
    accessorFn: (row) => row.value,
    header: 'Borrow Incentive',
    enableSorting: true,
    cell: ({ row }) => (
      <Text size='13'>{formatPrice(row.original.value, 1)}</Text>
    )
  },
  {
    id: 'price',
    accessorFn: (row) => row.price,
    header: 'Total',
    enableSorting: true,
    cell: ({ row }) => (
      <Text size='13'>{formatPrice(row.original.price, 1)}</Text>
    )
  },
  {
    id: 'source',
    accessorFn: (row) => row.source,
    header: 'Source',
    enableSorting: true,
    size: 120,
    cell: ({ row }) => (
      <AddressTooltip
        text={row.original.source}
        address={row.original.address}
        chain={row.original.chain}
      />
    )
  }
];

const DailyExpensesTable = ({ tableData, sortType }: TreasuryHoldingsProps) => {
  const mobileTableData = useMemo(() => {
    if (!sortType?.key) {
      return tableData;
    }

    const key = sortType.key as keyof TreasuryBalanceByNetworkType;
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
              (row.chain && explorers[row.chain.toLowerCase()]) ||
              defaultExplorer;

            const fullExplorerLink = `${explorerUrl}${row.address}`;

            return (
              <div
                key={row.symbol + index}
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
                  <Text
                    size='13'
                    lineHeight='21'
                    className='truncate'
                  >
                    {row.chain}
                  </Text>
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
                    {formatLargeNumber(row.qty, 1)}
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
                    {formatPrice(row.value, 1)}
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
                    {formatPrice(row.price, 1)}
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
                          {row.source}
                        </Text>
                        <div className='flex w-full items-center justify-between'>
                          <Text
                            size='14'
                            className='text-primary-11'
                          >
                            {sliceAddress(row.address, 7)}
                          </Text>
                          <ClipboardButton textToCopy={row.address} />
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
                      {row.source}
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
        columns={treasuryColumns}
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
