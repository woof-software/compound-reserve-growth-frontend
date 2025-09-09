import * as React from 'react';
import { useMemo } from 'react';

import HoverCard from '@/components/HoverCard/HoverCard';
import { MobileDataTable } from '@/components/MobileDataTable/MobileDataTable';
import { cn } from '@/shared/lib/classNames/classNames';
import {
  defaultExplorer,
  explorers,
  sliceAddress
} from '@/shared/lib/utils/utils';
import { ClipboardButton } from '@/shared/ui/AnimationProvider/CopyButton/CopyButton';
import CollateralAvatars from '@/shared/ui/CollateralAvatars/CollateralAvatars';
import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';

export type TreasuryBalanceByNetworkType = {
  symbol: string;
  qty: number;
  value: number;
  source: string;
  market: string;
  address: string;
  chain: string;
};

interface PresenceByMarketAndCollateralProps {
  tableData: TreasuryBalanceByNetworkType[];

  sortType: { key: string; type: string };
}

const treasuryColumns: ExtendedColumnDef<TreasuryBalanceByNetworkType>[] = [
  {
    accessorKey: 'source',
    header: 'Source',
    enableSorting: true,
    size: 200,
    cell: ({ row }) => {
      const { source } = row.original;

      return <Text size='13'>{source}</Text>;
    }
  },
  {
    accessorKey: 'symbol',
    header: 'Chain',
    enableSorting: true,
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
    accessorKey: 'symbol',
    header: 'Market',
    enableSorting: true,
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
    accessorKey: 'symbol',
    header: 'OEV on Collateral',
    enableSorting: true,
    size: 200,
    cell: ({ row }) => (
      <CollateralAvatars collaterals={Array(17).fill(row.original.symbol)} />
    )
  },
  {
    accessorKey: 'value',
    header: 'Price feed',
    enableSorting: true,
    size: 80,
    cell: ({ row }) => {
      const explorerUrl =
        (row.original.chain && explorers[row.original.chain.toLowerCase()]) ||
        defaultExplorer;

      const fullExplorerLink = `${explorerUrl}${row.original.address}`;
      return (
        <HoverCard
          content={
            <div className='flex w-50 flex-col items-start gap-3 py-2'>
              <div className='flex w-full items-center justify-between'>
                <Text
                  size='11'
                  weight='500'
                >
                  {row.original.source}
                </Text>
              </div>
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
              {row.original.symbol}
            </Text>
          </div>
        </HoverCard>
      );
    }
  }
];

const PresenceByMarketAndCollateralTable = ({
  sortType,
  tableData
}: PresenceByMarketAndCollateralProps) => {
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
        {(dataRows) => (
          <>
            {dataRows.map((row, index) => (
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
                    {row.source}
                  </Text>
                </div>
                <div className='grid w-full'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14'
                  >
                    Chain
                  </Text>
                  <div className='flex items-center gap-1'>
                    <Icon
                      name={row.chain || 'not-found-icon'}
                      className='h-4 w-4'
                      folder='collaterals'
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
                      {row.market}
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
                    OEV on Collateral
                  </Text>
                  <CollateralAvatars collaterals={Array(17).fill(row.symbol)} />
                </div>
                <div className='grid w-full'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14'
                  >
                    Price feed
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
            ))}
          </>
        )}
      </MobileDataTable>
      <div className='hidden w-full max-w-full lg:block'>
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
          paginationClassName='py-0 px-[5px]'
        />
      </div>
    </>
  );
};

export default PresenceByMarketAndCollateralTable;
