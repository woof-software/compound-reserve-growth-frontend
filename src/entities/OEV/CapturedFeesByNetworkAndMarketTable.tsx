import * as React from 'react';
import { useMemo } from 'react';

import { MobileDataTable } from '@/components/MobileDataTable/MobileDataTable';
import { cn } from '@/shared/lib/classNames/classNames';
import { formatNumber, formatPrice } from '@/shared/lib/utils/utils';
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

interface TreasuryBalanceByNetworkProps {
  tableData: TreasuryBalanceByNetworkType[];

  sortType: { key: string; type: string };
}

const treasuryColumns: ExtendedColumnDef<TreasuryBalanceByNetworkType>[] = [
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
    accessorKey: 'value',
    header: 'Fees by network',
    enableSorting: true,
    cell: ({ row }) => (
      <Text size='13'>{formatPrice(row.original.value, 1)}</Text>
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
    accessorKey: 'value',
    header: 'Fees by market',
    enableSorting: true,
    size: 100,
    cell: ({ row }) => (
      <Text size='13'>{formatPrice(row.original.value, 1)}</Text>
    )
  }
];

const CapturedFeesByNetworkAndMarketTable = ({
  sortType,
  tableData
}: TreasuryBalanceByNetworkProps) => {
  const footerRow = (
    <tr key='footer-total-row'>
      <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px] font-medium'>
        Total
      </td>
      <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px] font-medium'>
        {formatNumber(41680359)}
      </td>
      <td></td>
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
                    Chain
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
                    Fees by network
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
                    Fees by market
                  </Text>
                  <Text
                    size='13'
                    lineHeight='21'
                    className='truncate'
                  >
                    {formatPrice(row.value, 1)}
                  </Text>
                </div>
              </div>
            ))}
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
                  Fees by network
                </Text>
                <Text
                  size='13'
                  lineHeight='18'
                  weight='500'
                >
                  {formatPrice(9999.99)}
                </Text>
              </div>
              <div className='grid min-h-[39px] w-full max-w-[100px]'>
                <Text
                  size='13'
                  lineHeight='18'
                  weight='500'
                  className='text-primary-14'
                >
                  Fees by market
                </Text>
                <Text
                  size='13'
                  lineHeight='18'
                  weight='500'
                >
                  {formatPrice(9999.99)}
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

export default CapturedFeesByNetworkAndMarketTable;
