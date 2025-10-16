import * as React from 'react';
import { useMemo } from 'react';

import { MobileDataTable } from '@/components/MobileDataTable/MobileDataTable';
import { SortAdapter } from '@/shared/hooks/useSorting';
import { cn } from '@/shared/lib/classNames/classNames';
import { defaultExplorer, explorers } from '@/shared/lib/utils/utils';
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

export interface ReturnedFeesToTheCompoundProtocolTableProps {
  tableData: TreasuryBalanceByNetworkType[];

  sortType: SortAdapter<TreasuryBalanceByNetworkType>;
}

const treasuryColumns: ExtendedColumnDef<TreasuryBalanceByNetworkType>[] = [
  {
    id: 'chain',
    accessorFn: (row) => row.chain,
    header: 'TX Hash',
    enableSorting: true,
    size: 195,
    cell: ({ row }) => {
      const explorerUrl =
        (row.original.chain && explorers[row.original.chain.toLowerCase()]) ||
        defaultExplorer;

      const fullExplorerLink = `${explorerUrl}${row.original.address}`;

      return (
        <a
          href={fullExplorerLink}
          target='_blank'
          rel='noopener noreferrer'
        >
          <div className='flex items-center gap-1'>
            <Text size='13'>0xA2...14B4</Text>
            <Icon
              name='external-link'
              className='h-4 w-4'
            />
          </div>
        </a>
      );
    }
  },
  {
    id: 'chain',
    accessorFn: (row) => row.symbol,
    header: 'Event Data',
    enableSorting: true,
    cell: () => <Text size='13'>18.08.2025 at 09:43:35</Text>
  },
  {
    id: 'source',
    accessorFn: (row) => row.source,
    header: 'Source',
    enableSorting: true,
    cell: () => <Text size='13'>18.08.2025 at 09:43:35</Text>
  },
  {
    id: 'address',
    accessorFn: (row) => row.address,
    header: 'Compound Pay out',
    enableSorting: true,
    cell: () => <Text size='13'>$9999.99</Text>
  },
  {
    id: 'chain',
    accessorFn: (row) => row.chain,
    header: 'Liquidator',
    enableSorting: true,
    size: 100,
    cell: ({ row }) => {
      const explorerUrl =
        (row.original.chain && explorers[row.original.chain.toLowerCase()]) ||
        defaultExplorer;

      const fullExplorerLink = `${explorerUrl}${row.original.address}`;

      return (
        <a
          href={fullExplorerLink}
          target='_blank'
          rel='noopener noreferrer'
        >
          <div className='flex items-center gap-1'>
            <Text size='13'>0xA2...14B4</Text>
            <Icon
              name='external-link'
              className='h-4 w-4'
            />
          </div>
        </a>
      );
    }
  }
];

const ReturnedFeesToTheCompoundProtocolTable = ({
  tableData,
  sortType
}: ReturnedFeesToTheCompoundProtocolTableProps) => {
  const footerContent = (
    <tr>
      <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px] font-medium'>
        Total
      </td>
      <td></td>
      <td></td>
      <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px] font-medium'>
        $9999.99
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

              const txHashLink = `${explorerUrl}${row.address}`;
              const liquidatorLink = `${explorerUrl}${row.address}`;

              return (
                <div
                  key={row.symbol + index}
                  className={cn(
                    'border-secondary-23 flex flex-col gap-x-[26px] gap-y-3 border-b p-5 md:gap-x-[63px] md:px-10',
                    {
                      'border-none': dataRows.length - 1 === index
                    }
                  )}
                >
                  <div className='flex justify-between gap-x-[26px] md:gap-x-[63px]'>
                    <div className='grid w-fit'>
                      <Text
                        size='11'
                        lineHeight='18'
                        weight='500'
                        className='text-primary-14'
                      >
                        TX Hash
                      </Text>
                      <a
                        href={txHashLink}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        <div className='flex items-center gap-1'>
                          <Text size='13'>0xA2...14B4</Text>
                          <Icon
                            name='external-link'
                            className='h-4 w-4'
                          />
                        </div>
                      </a>
                    </div>
                    <div className='grid w-fit'>
                      <Text
                        size='11'
                        lineHeight='18'
                        weight='500'
                        className='text-primary-14'
                      >
                        Event Data
                      </Text>
                      <Text
                        size='13'
                        lineHeight='21'
                        className='truncate'
                      >
                        18.08.2025 at 09:43:35
                      </Text>
                    </div>
                  </div>
                  <div className='flex justify-between gap-x-[26px] md:gap-x-[63px]'>
                    <div className='grid w-fit'>
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
                        Market V3
                      </Text>
                    </div>
                    <div className='grid w-fit'>
                      <Text
                        size='11'
                        lineHeight='18'
                        weight='500'
                        className='text-primary-14'
                      >
                        Compound Pay out
                      </Text>
                      <Text
                        size='13'
                        lineHeight='21'
                        className='truncate'
                      >
                        $9999.99
                      </Text>
                    </div>
                    <div className='grid w-fit'>
                      <Text
                        size='11'
                        lineHeight='18'
                        weight='500'
                        className='text-primary-14'
                      >
                        Liquidator
                      </Text>
                      <a
                        href={liquidatorLink}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        <div className='flex items-center gap-1'>
                          <Text size='13'>0xA2...14B4</Text>
                          <Icon
                            name='external-link'
                            className='h-4 w-4'
                          />
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
            <div className='border-secondary-23 grid grid-cols-3 gap-x-[26px] gap-y-3 border-t p-5 md:gap-x-[63px] md:px-10'>
              <div className='grid min-h-[39px] w-full max-w-[120px]'>
                <Text
                  size='11'
                  lineHeight='18'
                  weight='500'
                  className='text-primary-14'
                >
                  Total
                </Text>
              </div>
              <div className='grid w-full max-w-[120px]'>
                <Text
                  size='11'
                  lineHeight='18'
                  weight='500'
                  className='text-primary-14'
                >
                  Compound Pay out
                </Text>
                <Text
                  size='13'
                  lineHeight='21'
                  weight='500'
                  className='truncate'
                >
                  $9999.99
                </Text>
              </div>
            </div>
          </>
        )}
      </MobileDataTable>
      <DataTable
        data={tableData}
        footerContent={footerContent}
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

export default ReturnedFeesToTheCompoundProtocolTable;
