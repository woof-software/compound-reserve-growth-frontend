import * as React from 'react';
import { useMemo } from 'react';

import HoverCard from '@/components/HoverCard/HoverCard';
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
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';

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

export interface CollateralsPriceProps {
  tableData: TreasuryBalanceByNetworkType[];

  sortType: { key: string; type: string };
}

const treasuryColumns: ExtendedColumnDef<TreasuryBalanceByNetworkType>[] = [
  {
    id: 'market',
    accessorFn: (row) => row.market,
    header: 'Source',
    enableSorting: true,
    cell: () => <Text size='13'>Market V2</Text>
  },
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
        <Text size='13'>{row.original.symbol}</Text>
      </div>
    )
  },
  {
    id: 'symbol',
    accessorFn: (row) => row.symbol,
    header: 'Market',
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
    id: 'symbol',
    accessorFn: (row) => row.symbol,
    header: 'Collateral',
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
    id: 'qty',
    accessorFn: (row) => row.qty,
    header: 'Collateral Price',
    enableSorting: true,
    cell: ({ row }) => (
      <Text size='13'>{formatLargeNumber(row.original.qty, 1)}</Text>
    )
  },
  {
    id: 'qty',
    accessorFn: (row) => row.qty,
    header: 'Price Restriction',
    enableSorting: true,
    cell: ({ row }) => (
      <Text size='13'>{formatLargeNumber(row.original.qty, 1)}</Text>
    )
  },
  {
    id: 'price',
    accessorFn: (row) => row.source,
    header: 'Price Feed',
    enableSorting: true,
    size: 120,
    cell: ({ row }) => {
      const explorerUrl =
        (row.original.chain && explorers[row.original.chain.toLowerCase()]) ||
        defaultExplorer;

      const fullExplorerLink = `${explorerUrl}${row.original.address}`;
      return (
        <HoverCard
          content={
            <div className='flex w-50 flex-col items-start gap-2'>
              <div className='flex w-full items-center justify-between'>
                <Text
                  size='12'
                  className='text-primary-11'
                >
                  {sliceAddress(row.original.address, 7)}
                </Text>
                <ClipboardButton textToCopy={row.original.address} />
              </div>
              <div className='flex w-full items-center justify-between'>
                <Text
                  size='12'
                  className='text-primary-11'
                >
                  View on Explorer
                </Text>
                <a
                  href={fullExplorerLink}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-primary-11 flex h-4 w-4 items-center justify-center'
                >
                  <Icon
                    name={'arrow-link'}
                    className='h-4.5 w-3 text-[#7A8A99]'
                  />
                </a>
              </div>
            </div>
          }
          side='top'
        >
          <div
            className='flex items-start'
            style={{ width: `${120}px` }}
          >
            <Text
              size='13'
              className='text-primary-11 inline-block max-w-full cursor-pointer truncate border-b border-dotted border-gray-500 leading-none'
            >
              {`${row.original.address.slice(0, 4)}...${row.original.address.slice(-4)}`}
            </Text>
          </div>
        </HoverCard>
      );
    }
  }
];

const CollateralsPrice = ({ tableData, sortType }: CollateralsPriceProps) => {
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
                    Source
                  </Text>
                  <Text
                    size='13'
                    lineHeight='21'
                    className='truncate'
                  >
                    Market V2
                  </Text>
                </div>
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
                      name={row.chain.toLowerCase() || 'not-found-icon'}
                      className='h-4 w-4'
                      folder='network'
                    />
                    <Text
                      size='13'
                      lineHeight='21'
                      className='truncate'
                    >
                      {row.chain}
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
                  <div className='flex items-center gap-1'>
                    <Icon
                      name={row.market || 'not-found-icon'}
                      className='h-4 w-4'
                      folder='collaterals'
                    />
                    <Text
                      size='13'
                      lineHeight='21'
                      className='truncate'
                    >
                      {row.market === 'no market' ? ' - ' : row.market}
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
                    Collateral
                  </Text>
                  <div className='flex items-center gap-1'>
                    <Icon
                      name={row.market || 'not-found-icon'}
                      className='h-4 w-4'
                      folder='collaterals'
                    />
                    <Text
                      size='13'
                      lineHeight='21'
                      className='truncate'
                    >
                      {row.market === 'no market' ? ' - ' : row.market}
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
                    Collateral Price
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
                    Price Restriction
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
                    Price Feed
                  </Text>
                  <a
                    href={fullExplorerLink}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <Text
                      size='13'
                      lineHeight='21'
                      className='w-fit truncate border-b border-dotted border-gray-500'
                    >
                      {`${row.address.slice(0, 4)}...${row.address.slice(-4)}`}
                    </Text>
                  </a>
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

export default CollateralsPrice;
