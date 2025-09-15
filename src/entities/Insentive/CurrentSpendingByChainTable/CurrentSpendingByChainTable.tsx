import * as React from 'react';
import { useMemo } from 'react';

import { cn } from '@/shared/lib/classNames';
import {
  formatLargeNumber,
  formatNumber,
  formatPrice,
  formatQuantity,
  sliceAddress
} from '@/shared/lib/utils/utils';
import { HoverCard, Icon, Text } from '@/shared/ui/atoms';
import { ClipboardButton } from '@/shared/ui/molecules/CopyButton/CopyButton';
import { MobileDataTable } from '@/shared/ui/molecules/MobileDataTable/MobileDataTable';
import { DataTable, ExtendedColumnDef } from '@/shared/ui/molecules';
import { defaultExplorer, explorers } from '@/shared/consts';

export type TreasuryBalanceByNetworkType = {
  symbol: string;
  qty: number;
  value: number;
  source: string;
  market: string;
  address: string;
  chain: string;
};

interface TreasuryBalanceByNetworkProps {
  tableData: TreasuryBalanceByNetworkType[];

  sortType: { key: string; type: string };
}

const treasuryColumns: ExtendedColumnDef<TreasuryBalanceByNetworkType>[] = [
  {
    accessorKey: 'symbol',
    header: 'Network',
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
    header: 'Value COMP',
    enableSorting: true,
    cell: ({ row }) => (
      <Text size='13'>{formatLargeNumber(row.original.qty, 1)}</Text>
    )
  },
  {
    accessorKey: 'value',
    header: 'Value USDC',
    enableSorting: true,
    cell: ({ row }) => (
      <Text size='13'>{formatPrice(row.original.value, 1)}</Text>
    )
  },
  {
    accessorKey: 'source',
    header: 'Source',
    enableSorting: true,
    size: 120,
    cell: ({ row }) => {
      const { source } = row.original;

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
                  {source}
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
              {source}
            </Text>
          </div>
        </HoverCard>
      );
    }
  }
];

const CurrentSpendingByChainTable = ({
  sortType,
  tableData
}: TreasuryBalanceByNetworkProps) => {
  const footerRow = (
    <tr key='footer-total-row'>
      <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px] font-medium'>
        Total
      </td>
      <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px] font-medium'>
        {formatQuantity(41680359)}
      </td>
      <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px] font-medium'>
        {formatNumber(54448945)}
      </td>
    </tr>
  );

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
            {dataRows.map((row, index) => {
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
                      Value COMP
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
                      Value USDC
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
                      Source
                    </Text>
                    <a
                      href={fullExplorerLink}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      <Text
                        size='13'
                        lineHeight='21'
                        className='w-fit truncate border-b border-dashed border-gray-500'
                      >
                        {row.source}
                      </Text>
                    </a>
                  </div>
                </div>
              );
            })}
            <div
              className={cn(
                'grid grid-cols-3 gap-x-10 gap-y-3 p-5 md:gap-x-[63px] md:px-10'
              )}
            >
              <div className='grid min-h-[39px] w-full max-w-[100px]'>
                <Text
                  size='13'
                  lineHeight='18'
                  weight='500'
                  className='text-primary-14'
                >
                  Total
                </Text>
              </div>
              <div className='grid min-h-[39px] w-full max-w-[100px]'>
                <Text
                  size='13'
                  lineHeight='18'
                  weight='500'
                  className='text-primary-14'
                >
                  Value COMP
                </Text>
                <Text
                  size='13'
                  lineHeight='18'
                  weight='500'
                >
                  {formatQuantity(41680359)}
                </Text>
              </div>
              <div className='grid min-h-[39px] w-full max-w-[100px]'>
                <Text
                  size='13'
                  lineHeight='18'
                  weight='500'
                  className='text-primary-14'
                >
                  Value USDC
                </Text>
                <Text
                  size='13'
                  lineHeight='18'
                  weight='500'
                >
                  {formatNumber(54448945)}
                </Text>
              </div>
            </div>
          </>
        )}
      </MobileDataTable>
      <div className='hidden w-full max-w-full lg:block lg:max-w-[522px]'>
        <DataTable
          data={tableData}
          columns={treasuryColumns}
          footerContent={footerRow}
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

export default CurrentSpendingByChainTable;
