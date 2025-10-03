import { useMemo } from 'react';

import HoverCard from '@/components/HoverCard/HoverCard';
import { MobileDataTable } from '@/components/MobileDataTable/MobileDataTable';
import { cn } from '@/shared/lib/classNames/classNames';
import {
  capitalizeFirstLetter,
  defaultExplorer,
  explorers,
  formatNumber,
  formatPrice,
  formatQuantity,
  sliceAddress
} from '@/shared/lib/utils/utils';
import { Source } from '@/shared/types/types';
import { ClipboardButton } from '@/shared/ui/AnimationProvider/CopyButton/CopyButton';
import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';

export type SpendingByChainTableColumns = {
  network: string;
  valueComp: number;
  valueUsd: number;
  source: Source;
};

interface CurrentSpendingByChainTableProps {
  tableData: SpendingByChainTableColumns[];
  sortType: { key: string; type: string };
}

const SpendingByChainTableColumns: ExtendedColumnDef<SpendingByChainTableColumns>[] =
  [
    {
      id: 'Network',
      header: 'Network',
      accessorFn: (row) => row.network,
      enableSorting: true,
      cell: ({ row }) => (
        <div className='flex items-center gap-3'>
          <Icon
            name={row.original.source.network || 'not-found-icon'}
            className='h-6 w-6'
            folder='network'
          />
          <Text
            size='13'
            weight='500'
          >
            {capitalizeFirstLetter(row.original.source.network)}
          </Text>
        </div>
      )
    },
    {
      id: 'ValueComp',
      accessorFn: (row) => row.valueComp,
      header: 'Value COMP',
      enableSorting: true,
      cell: ({ row }) => (
        <Text size='13'>{formatPrice(row.original.valueComp)}</Text>
      )
    },
    {
      id: 'ValueUSDC',
      accessorFn: (row) => row.valueUsd,
      header: 'Value USDC',
      enableSorting: true,
      cell: ({ row }) => (
        <Text size='13'>{formatPrice(row.original.valueUsd)}</Text>
      )
    },
    {
      id: 'Source',
      accessorFn: (row) => row.source,
      header: 'Source',
      enableSorting: true,
      size: 120,
      cell: ({ row }) => {
        const { source } = row.original;

        const explorerUrl =
          (row.original.source &&
            explorers[row.original.source.network.toLowerCase()]) ||
          defaultExplorer;

        const fullExplorerLink = `${explorerUrl}${row.original.source.address}`;

        return (
          <HoverCard
            content={
              <div className='flex w-50 flex-col items-start gap-3 py-2'>
                <div className='flex w-full items-center justify-between'>
                  <Text
                    size='11'
                    weight='500'
                  >
                    {source.market}
                  </Text>
                </div>
                <div className='flex w-full items-center justify-between'>
                  <Text
                    size='12'
                    className='text-primary-11'
                  >
                    {sliceAddress(row.original.source.address, 7)}
                  </Text>
                  <ClipboardButton textToCopy={row.original.source.address} />
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
                {source.market}
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
}: CurrentSpendingByChainTableProps) => {
  const mobileTableData = useMemo(() => {
    if (!sortType?.key) {
      return tableData;
    }

    const key = sortType.key;
    return [...tableData].sort((a, b) => {
      // @ts-expect-error TODO: fix key index error
      const aVal = a[key];
      // @ts-expect-error TODO: fix key index error
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
                (row.source && explorers[row.source.network.toLowerCase()]) ||
                defaultExplorer;

              const fullExplorerLink = `${explorerUrl}${row.source.address}`;

              return (
                <div
                  key={row.source.assetId}
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
                        name={row.source.network || 'not-found-icon'}
                        className='h-4 w-4'
                        folder='network'
                      />
                      <Text
                        size='13'
                        lineHeight='21'
                        className='truncate'
                      >
                        {capitalizeFirstLetter(row.source.network)}
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
                      {formatPrice(row.valueComp)}
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
                      {formatPrice(row.valueUsd, 1)}
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
                        {sliceAddress(row.source.address, 7)}
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
        />
      </div>
    </>
  );
};

export default CurrentSpendingByChainTable;
