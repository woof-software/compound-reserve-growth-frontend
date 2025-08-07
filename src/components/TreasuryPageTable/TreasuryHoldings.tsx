import * as React from 'react';
import { type ColumnDef } from '@tanstack/react-table';

import { usePagination } from '@/shared/hooks/usePagination';
import { cn } from '@/shared/lib/classNames/classNames';
import { formatLargeNumber, formatPrice } from '@/shared/lib/utils/utils';
import Button from '@/shared/ui/Button/Button';
import DataTable from '@/shared/ui/DataTable/DataTable';
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
}

const treasuryColumns: ColumnDef<TreasuryBalanceByNetworkType>[] = [
  {
    accessorKey: 'symbol',
    header: 'Symbol',
    enableSorting: true,
    size: 168,
    cell: ({ row }) => (
      <div className='flex items-center gap-3'>
        <Icon
          name={row.original.symbol || 'not-found-icon'}
          className='h-6 w-6'
          folder='collaterals'
        />
        <Text size='13'>{row.original.symbol}</Text>
      </div>
    )
  },
  {
    accessorKey: 'chain',
    header: 'Chain',
    enableSorting: true
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
    accessorKey: 'price',
    header: 'Price',
    enableSorting: true,
    cell: ({ row }) => (
      <Text size='13'>{formatPrice(row.original.price, 1)}</Text>
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

const MobileDataTable = ({ tableData }: TreasuryHoldingsProps) => {
  const pageSize = 10;

  const { dataRows, pageIndex, maxPages, goNext, goPrev, goLast, goFirst } =
    usePagination({
      tableData,
      pageSize
    });

  return (
    <div className='block lg:hidden'>
      {dataRows.map((row, index) => (
        <div
          key={index}
          className='border-secondary-23 flex flex-wrap items-center justify-items-start gap-x-[63px] gap-y-3 border-b px-10 py-5'
        >
          <div className='grid w-full max-w-[73px]'>
            <Text
              size='8'
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
                size='11'
                lineHeight='21'
                className='truncate'
              >
                {row.symbol}
              </Text>
            </div>
          </div>
          <div className='grid w-full max-w-[73px]'>
            <Text
              size='8'
              lineHeight='18'
              weight='500'
              className='text-primary-14'
            >
              Chain
            </Text>
            <Text
              size='11'
              lineHeight='21'
              className='truncate'
            >
              {row.chain}
            </Text>
          </div>
          <div className='grid w-full max-w-[73px]'>
            <Text
              size='8'
              lineHeight='18'
              weight='500'
              className='text-primary-14'
            >
              Market
            </Text>
            <Text
              size='11'
              lineHeight='21'
              className='truncate'
            >
              {row.market === 'no market' ? ' - ' : row.market}
            </Text>
          </div>
          <div className='grid w-full max-w-[73px]'>
            <Text
              size='8'
              lineHeight='18'
              weight='500'
              className='text-primary-14'
            >
              QTY
            </Text>
            <Text
              size='11'
              lineHeight='21'
              className='truncate'
            >
              {formatLargeNumber(row.qty, 1)}
            </Text>
          </div>
          <div className='grid w-full max-w-[73px]'>
            <Text
              size='8'
              lineHeight='18'
              weight='500'
              className='text-primary-14'
            >
              Value
            </Text>
            <Text
              size='11'
              lineHeight='21'
              className='truncate'
            >
              {formatPrice(row.value, 1)}
            </Text>
          </div>
          <div className='grid w-full max-w-[73px]'>
            <Text
              size='8'
              lineHeight='18'
              weight='500'
              className='text-primary-14'
            >
              Price
            </Text>
            <Text
              size='11'
              lineHeight='21'
              className='truncate'
            >
              {formatPrice(row.price, 1)}
            </Text>
          </div>
          <div className='grid w-full max-w-[73px]'>
            <Text
              size='8'
              lineHeight='18'
              weight='500'
              className='text-primary-14'
            >
              Source
            </Text>
            <Text
              size='11'
              lineHeight='21'
              className='truncate'
            >
              {row.source}
            </Text>
          </div>
        </div>
      ))}
      <div className='flex items-center justify-between px-10 py-5'>
        <Text className='text-primary-14 !text-[12.6px]'>
          Showing{' '}
          <span className='mx-1 text-[11.5px] leading-[21px] font-bold'>
            {pageIndex * pageSize + 1}
          </span>
          to{' '}
          <span className='mx-1 text-[11.5px] leading-[21px] font-bold'>
            {Math.min((pageIndex + 1) * pageSize, tableData.length)}
          </span>
          of{' '}
          <span className='mx-1 text-[11.5px] leading-[21px] font-bold'>
            {tableData.length}
          </span>{' '}
          results
        </Text>
        <div className='flex items-center gap-1'>
          <Button
            onClick={goFirst}
            disabled={pageIndex === 0}
            className='text-primary-14 hover:bg-secondary-22 size-8 cursor-pointer rounded-lg disabled:cursor-not-allowed disabled:opacity-50'
          >
            <Icon
              name='double-arrow'
              className='h-4 w-4'
            />
          </Button>
          <Button
            onClick={goPrev}
            disabled={pageIndex === 0}
            className='text-primary-14 hover:bg-secondary-22 flex h-8 cursor-pointer items-center gap-2 rounded-lg pt-2 pr-2.5 pb-2 pl-2 text-[11px] font-medium disabled:cursor-not-allowed disabled:opacity-50'
          >
            <Icon
              name='arrow-left'
              className='h-4 w-4'
            />
            <span className='text-[11px] leading-none font-medium'>
              Previous
            </span>
          </Button>
          <Button
            onClick={goNext}
            disabled={pageIndex === maxPages - 1}
            className='text-primary-14 hover:bg-secondary-22 flex h-8 cursor-pointer items-center gap-2 rounded-lg pt-2 pr-2 pb-2 pl-2.5 text-[11px] font-medium disabled:cursor-not-allowed disabled:opacity-50'
          >
            <span className='text-[11px] leading-none font-medium'>Next</span>
            <Icon
              name='arrow-right'
              className='h-4 w-4'
            />
          </Button>
          <Button
            onClick={goLast}
            disabled={pageIndex === maxPages - 1}
            className='text-primary-14 hover:bg-secondary-22 size-8 rotate-180 cursor-pointer rounded-lg disabled:cursor-not-allowed disabled:opacity-50'
          >
            <Icon
              name='double-arrow'
              className='h-4 w-4'
            />
          </Button>
        </div>
      </div>
    </div>
  );
};

const TreasuryHoldings = ({ tableData }: TreasuryHoldingsProps) => {
  return (
    <>
      <MobileDataTable tableData={tableData} />
      <DataTable
        data={tableData}
        columns={treasuryColumns}
        enableSorting
        enablePagination
        pageSize={10}
        containerTableClassName='min-h-[518px]'
        className={cn('hidden flex-col justify-between lg:flex', {
          'min-h-[565px]': tableData.length > 10
        })}
        headerCellClassName='py-[13px] px-[5px]'
        cellClassName='py-3 px-[5px]'
        headerTextClassName='text-primary-14 font-medium'
        paginationClassName='py-[13px] px-[5px]'
      />
    </>
  );
};

export default TreasuryHoldings;
