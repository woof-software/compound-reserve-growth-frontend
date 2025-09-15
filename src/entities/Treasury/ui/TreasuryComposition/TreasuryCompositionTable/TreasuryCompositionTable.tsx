import { useMemo } from 'react';
import * as React from 'react';

import {
  TreasuryCompositionTableProps,
  TreasuryCompositionTableType,
  TreasuryCompositionType
} from '@/entities/Treasury';
import { cn } from '@/shared/lib/classNames';
import { formatPrice } from '@/shared/lib/utils/utils';
import { Icon, Text, View } from '@/shared/ui/atoms';
import {
  DataTable,
  ExtendedColumnDef,
  MobileDataTable
} from '@/shared/ui/molecules';

const filterConfig = {
  Market: {
    folder: 'collaterals' as const,
    getIconName: (row: TreasuryCompositionTableType) =>
      row.symbol || 'not-found-icon'
  },
  Chain: {
    folder: 'network' as const,
    getIconName: (row: TreasuryCompositionTableType) =>
      (row.icon || 'not-found-icon').toLowerCase()
  },
  'Asset Type': {
    folder: 'token' as const,
    getIconName: (row: TreasuryCompositionTableType) =>
      (row.icon || 'not-found-icon').toLowerCase()
  }
};

const TreasuryCompositionTable = ({
  sortType,
  tableData,
  totalBalance,
  activeFilter
}: TreasuryCompositionTableProps) => {
  const columns = useMemo<
    ExtendedColumnDef<TreasuryCompositionTableType>[]
  >(() => {
    const config = filterConfig[activeFilter];

    return [
      {
        accessorKey: 'name',
        header: activeFilter === 'Asset Type' ? 'Asset' : activeFilter,
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <View.Condition if={activeFilter !== 'Market'}>
              <Icon
                name={config.getIconName(row.original)}
                className='h-6 w-6'
                folder={config.folder}
              />
            </View.Condition>
            <Text
              size='13'
              weight='500'
            >
              {row.original.name}
            </Text>
          </div>
        )
      },
      {
        accessorKey: 'balance',
        header: 'Total Balance USD',
        align: 'right',
        cell: ({ row }) => (
          <Text
            size='13'
            weight='400'
            className='text-right'
          >
            {formatPrice(row.original.balance, 1)}
          </Text>
        )
      }
    ];
  }, [activeFilter]);

  const mobileTableData = useMemo(() => {
    if (!sortType?.key) {
      return tableData;
    }

    const key = sortType.key as keyof TreasuryCompositionType;
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
      <MobileDataTable
        className='md:hidden'
        tableData={mobileTableData}
      >
        {(dataRows) => (
          <>
            {dataRows.map((row, index) => (
              <div
                key={row.name + index}
                className={cn(
                  'border-secondary-23 flex flex-wrap items-center justify-between gap-x-3 gap-y-3 border-b p-5 md:gap-x-[63px]',
                  {
                    'pt-0': index === 0
                  }
                )}
              >
                <div className='grid w-full max-w-[100px]'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14 min-w-[100px]'
                  >
                    {activeFilter === 'Asset Type' ? 'Asset' : activeFilter}
                  </Text>
                  <div className='flex items-center gap-1'>
                    <View.Condition if={activeFilter !== 'Market'}>
                      <Icon
                        name={filterConfig[activeFilter].getIconName(row)}
                        className='h-4 w-4'
                        folder={filterConfig[activeFilter].folder}
                      />
                    </View.Condition>
                    <Text
                      size='13'
                      lineHeight='21'
                      className='truncate'
                    >
                      {row.name}
                    </Text>
                  </div>
                </div>
                <div className='grid w-full max-w-[100px]'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14'
                  >
                    Total Balance USD
                  </Text>
                  <Text
                    size='13'
                    lineHeight='21'
                    className='truncate'
                  >
                    {formatPrice(row.balance, 1)}
                  </Text>
                </div>
              </div>
            ))}
            <div className='flex w-full items-center justify-between px-6 py-5'>
              <Text
                size='13'
                lineHeight='18'
                weight='500'
                className='text-primary-14 min-w-[100px]'
              >
                Total Balance
              </Text>
              <Text
                size='13'
                lineHeight='21'
                weight='500'
                className='text-primary-14 min-w-[100px] truncate'
              >
                {formatPrice(totalBalance, 1)}
              </Text>
            </div>
          </>
        )}
      </MobileDataTable>
      <div className='hide-scrollbar hidden max-h-[400px] w-full max-w-full overflow-y-auto md:block md:max-w-2/5 lg:max-w-[522px]'>
        <DataTable
          data={tableData}
          columns={columns}
          pageSize={10}
          enableSorting={true}
          headerCellClassName='py-[13px] px-[5px]'
          cellClassName='py-3 px-[5px] !font-medium'
          headerTextClassName='text-primary-14'
        />
        <div className='flex items-center justify-between px-[5px] py-3'>
          <Text
            size='13'
            weight='500'
            className='text-primary-14'
          >
            Total Balance
          </Text>
          <Text
            size='13'
            weight='500'
            className='text-primary-14'
          >
            {formatPrice(totalBalance, 1)}
          </Text>
        </div>
      </div>
    </>
  );
};

export { TreasuryCompositionTable };
