import * as React from 'react';
import { useMemo } from 'react';

import { MobileDataTable } from '@/components/MobileDataTable/MobileDataTable';
import { SortAdapter } from '@/shared/hooks/useSorting';
import { cn } from '@/shared/lib/classNames/classNames';
import { formatLargeNumber, formatPrice } from '@/shared/lib/utils/utils';
import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';

import { AddressTooltip } from '../AddressTooltip/AddressTooltip';

export type TreasuryBalanceByNetworkType = {
  symbol: string;
  qty: number;
  value: number;
  source: string;
  market: string;
  price: number;
  address: string;
  chain: string;
};

interface TreasuryBalanceByNetworkProps {
  tableData: TreasuryBalanceByNetworkType[];

  sortType: SortAdapter<TreasuryBalanceByNetworkType>;
}

const treasuryColumns: ExtendedColumnDef<TreasuryBalanceByNetworkType>[] = [
  {
    accessorKey: 'symbol',
    header: 'Symbol',
    enableSorting: true,
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
    accessorKey: 'qty',
    header: 'QTY',
    enableSorting: true,
    cell: ({ row }) => (
      <Text size='13'>{formatLargeNumber(row.original.qty, 1)}</Text>
    )
  },
  {
    accessorKey: 'value',
    header: 'Value',
    enableSorting: true,
    cell: ({ row }) => (
      <Text size='13'>{formatPrice(row.original.value, 1)}</Text>
    )
  },
  {
    accessorKey: 'market',
    header: 'Market',
    enableSorting: true,
    cell: ({ row }) => (
      <Text size='13'>
        {row.original.market === 'no market' ? ' - ' : row.original.market}
      </Text>
    )
  },
  {
    accessorKey: 'source',
    header: 'Source',
    enableSorting: true,
    size: 120,
    cell: ({ row }) => {
      const { source, address, chain } = row.original;

      return (
        <AddressTooltip
          text={source}
          address={address}
          chain={chain}
        />
      );
    }
  }
];

const TreasuryBalanceByNetwork = ({
  sortType,
  tableData
}: TreasuryBalanceByNetworkProps) => {
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
          dataRows.map((row, index) => (
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
                  Symbol
                </Text>
                <div className='flex items-center gap-1'>
                  <Icon
                    name={row.symbol || 'not-found-icon'}
                    className='h-4 w-4'
                    folder='collaterals'
                  />
                  <Text
                    size='13'
                    lineHeight='21'
                    className='truncate'
                  >
                    {row.symbol}
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
                  QTY
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
                  Value
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
                  Source
                </Text>
                <Text
                  size='13'
                  lineHeight='21'
                  className='truncate'
                >
                  {row.source}
                </Text>
              </div>
            </div>
          ))
        }
      </MobileDataTable>
      <div className='hidden w-full max-w-full lg:block lg:max-w-[522px]'>
        <DataTable
          data={tableData}
          columns={treasuryColumns}
          enableSorting
          enablePagination
          pageSize={10}
          containerTableClassName='min-h-[518px]'
          className='flex min-h-[565px] flex-col justify-between'
          headerCellClassName='py-[13px] px-[5px]'
          cellClassName='py-3 px-[5px]'
          headerTextClassName='text-primary-14 font-medium'
          paginationClassName='py-0 pb-0 px-[5px]'
        />
      </div>
    </>
  );
};

export default TreasuryBalanceByNetwork;
