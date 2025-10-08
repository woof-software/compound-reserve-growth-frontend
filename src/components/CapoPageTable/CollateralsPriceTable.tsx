import * as React from 'react';
import { useMemo } from 'react';

import HoverCard from '@/components/HoverCard/HoverCard';
import { MobileDataTable } from '@/components/MobileDataTable/MobileDataTable';
import { SortAdapter } from '@/shared/hooks/useSorting';
import { cn } from '@/shared/lib/classNames/classNames';
import {
  defaultExplorer,
  explorers,
  sliceAddress
} from '@/shared/lib/utils/utils';
import { CapoTableItem } from '@/shared/types/Capo/types';
import { ClipboardButton } from '@/shared/ui/AnimationProvider/CopyButton/CopyButton';
import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';

export interface CollateralsPriceProps {
  tableData: CapoTableItem[];
  sortType: SortAdapter<CapoTableItem>;
}

const treasuryColumns: ExtendedColumnDef<CapoTableItem>[] = [
  {
    id: 'network',
    accessorFn: (row) => row.network,
    header: 'Network',
    enableSorting: true,
    cell: ({ row }) => (
      <div className='flex items-center gap-3'>
        <Icon
          name={row.original.network.toLowerCase() || 'not-found-icon'}
          className='h-6 w-6'
          folder='network'
        />
        <Text size='13'>{row.original.network}</Text>
      </div>
    )
  },
  {
    id: 'collateral',
    accessorFn: (row) => row.collateral,
    header: 'Collateral',
    enableSorting: true,
    cell: ({ row }) => (
      <div className='flex items-center gap-3'>
        <Icon
          name={row.original.collateral || 'not-found-icon'}
          className='h-6 w-6'
          folder='collaterals'
        />
        <Text size='13'>{row.original.collateral}</Text>
      </div>
    )
  },
  {
    id: 'collateralPrice',
    accessorFn: (row) => row.collateralPrice,
    header: 'Collateral Price',
    enableSorting: true,
    size: 215,
    cell: ({ row }) => (
      <Text size='13'>${Number(row.original.collateralPrice).toFixed(2)}</Text>
    )
  },
  {
    id: 'priceRestriction',
    accessorFn: (row) => row.priceRestriction,
    header: 'Price Restriction',
    enableSorting: true,
    size: 215,
    cell: ({ row }) => (
      <Text size='13'>${Number(row.original.priceRestriction).toFixed(2)}</Text>
    )
  },
  {
    id: 'priceFeed',
    accessorFn: (row) => row.priceFeed,
    header: 'Price Feed',
    enableSorting: true,
    align: 'right',
    size: 80,
    cell: ({ row }) => {
      const explorerUrl =
        (row.original.network &&
          explorers[row.original.network.toLowerCase()]) ||
        defaultExplorer;

      const fullExplorerLink = `${explorerUrl}${row.original.priceFeed}`;
      return (
        <HoverCard
          content={
            <div className='flex w-50 flex-col items-start gap-2'>
              <Text
                size={'14'}
                className={'mb-2 w-full truncate'}
              >
                {row.original.oracleName}
              </Text>
              <div className='flex w-full items-center justify-between'>
                <Text
                  size='12'
                  className='text-primary-11'
                >
                  {sliceAddress(row.original.priceFeed, 7)}
                </Text>
                <ClipboardButton textToCopy={row.original.priceFeed} />
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
          <div className='flex justify-end'>
            <Text
              size='13'
              className='text-primary-11 inline-block max-w-full cursor-pointer truncate border-b border-dotted border-gray-500 leading-none'
            >
              {`${row.original.priceFeed.slice(0, 4)}...${row.original.priceFeed.slice(-4)}`}
            </Text>
          </div>
        </HoverCard>
      );
    }
  }
];

const CollateralsPriceTable = ({
  tableData,
  sortType
}: CollateralsPriceProps) => {
  const mobileTableData = useMemo(() => {
    if (!sortType?.key) {
      return tableData;
    }

    const key = sortType.key as keyof CapoTableItem;
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
              (row.network && explorers[row.network.toLowerCase()]) ||
              defaultExplorer;

            const fullExplorerLink = `${explorerUrl}${row.priceFeed}`;

            return (
              <div
                key={row.network + index}
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
                      name={row.network.toLowerCase() || 'not-found-icon'}
                      className='h-4 w-4'
                      folder='network'
                    />
                    <Text
                      size='13'
                      lineHeight='21'
                      className='truncate'
                    >
                      {row.network}
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
                      name={row.collateral || 'not-found-icon'}
                      className='h-4 w-4'
                      folder='collaterals'
                    />
                    <Text
                      size='13'
                      lineHeight='21'
                      className='truncate'
                    >
                      {row.collateral === 'no market' ? ' - ' : row.collateral}
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
                    ${Number(row.collateralPrice).toFixed(2)}
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
                    {Number(row.priceRestriction).toFixed(2)}
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
                      {`${row.priceFeed.slice(0, 4)}...${row.priceFeed.slice(-4)}`}
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
        tableClassName='table-fixed w-full'
      />
    </>
  );
};

export default CollateralsPriceTable;
