import { useMemo } from 'react';

import { MobileDataTable } from '@/components/MobileDataTable/MobileDataTable';
import { SortAdapter } from '@/shared/hooks/useSorting';
import { cn } from '@/shared/lib/classNames/classNames';
import { NumbersFormatter } from '@/shared/lib/utils/numbersFormatter';
import {
  capitalizeFirstLetter,
  formatNumber,
  formatUSD
} from '@/shared/lib/utils/utils';
import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';

export type SpendingByChainTableColumns = {
  network: string;
  valueComp: number;
  valueUsd: number;
};

interface CurrentSpendingByChainTableProps {
  tableData: SpendingByChainTableColumns[];
  sortType: SortAdapter<SpendingByChainTableColumns>;
}

const SpendingByChainTableColumns: ExtendedColumnDef<SpendingByChainTableColumns>[] =
  [
    {
      id: 'Network',
      header: 'Network',
      accessorFn: (row) => row.network,
      enableSorting: true,
      size: 170,
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
      id: 'ValueComp',
      accessorFn: (row) => row.valueComp,
      header: 'Value COMP',
      enableSorting: true,
      align: 'right',
      cell: ({ row }) => (
        <Text
          size='13'
          className={'flex justify-end'}
        >
          {NumbersFormatter.universal(row.original.valueComp, 'full', 4)}
        </Text>
      )
    },
    {
      id: 'ValueUSDC',
      accessorFn: (row) => row.valueUsd,
      header: 'Value USD',
      enableSorting: true,
      align: 'right',
      cell: ({ row }) => (
        <Text
          className={'flex justify-end'}
          size='13'
        >
          {NumbersFormatter.price(row.original.valueUsd, 'full')}
        </Text>
      )
    }
  ];

const CurrentSpendingByChainTable = ({
  sortType,
  tableData
}: CurrentSpendingByChainTableProps) => {
  const mobileTableData = useMemo(() => {
    if (!sortType?.key) {
      return tableData;
    }

    const key = sortType.key;

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
  }, [tableData, sortType.key, sortType.type]);

  return (
    <>
      <MobileDataTable tableData={mobileTableData}>
        {(dataRows) => (
          <>
            {dataRows.map((row, index) => {
              return (
                <div
                  key={`${row.network} + ${row.valueComp}`}
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
                        name={row.network || 'not-found-icon'}
                        className='h-4 w-4'
                        folder='network'
                      />
                      <Text
                        size='13'
                        lineHeight='21'
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
                      Value COMP
                    </Text>
                    <Text
                      size='13'
                      lineHeight='21'
                      className='truncate'
                    >
                      {formatNumber(row.valueComp, '')}
                    </Text>
                  </div>
                  <div className='grid w-full'>
                    <Text
                      size='11'
                      lineHeight='18'
                      weight='500'
                      className='text-primary-14'
                    >
                      Value USD
                    </Text>
                    <Text
                      size='13'
                      lineHeight='21'
                      className='truncate'
                    >
                      {formatUSD(row.valueUsd, 'compact')}
                    </Text>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </MobileDataTable>
      <div className='hidden w-full max-w-full lg:block lg:max-w-100'>
        <DataTable
          data={tableData}
          columns={SpendingByChainTableColumns}
          enableSorting={true}
          enablePagination={true}
          pageSize={10}
          containerTableClassName='min-h-[518px]'
          className='flex min-h-[565px] flex-col justify-between'
          headerCellClassName='py-[13px] px-[5px]'
          cellClassName='py-3 px-[5px]'
          headerTextClassName='text-primary-14 font-medium'
          paginationClassName='py-0 px-[5px]'
          tableClassName='table-fixed w-full'
        />
      </div>
    </>
  );
};

export default CurrentSpendingByChainTable;
