import * as React from 'react';
import { useMemo } from 'react';

import HoverCard from '@/components/HoverCard/HoverCard';
import { MobileDataTable } from '@/components/MobileDataTable/MobileDataTable';
import { NOT_MARKET } from '@/shared/consts/consts';
import { SortAdapter } from '@/shared/hooks/useSorting';
import { cn } from '@/shared/lib/classNames/classNames';
import { Format } from '@/shared/lib/utils/numbersFormatter';
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
  onSelectCollateralRow: (network: string, collateral: string) => void;
}

const collateralTableColumns: ExtendedColumnDef<CapoTableItem>[] = [
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
        <Text
          size='13'
          weight='500'
        >
          {row.original.network}
        </Text>
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
    sortDescFirst: true,
    size: 215,
    cell: ({ row }) => (
      <Text size='13'>
        {Format.price(row.original.collateralPrice, 'standard')}
      </Text>
    )
  },
  {
    id: 'priceRestriction',
    accessorFn: (row) => row.priceRestriction,
    header: 'Price Restriction',
    enableSorting: true,
    sortDescFirst: true,
    size: 215,
    cell: ({ row }) => (
      <Text size='13'>
        {Format.price(row.original.priceRestriction, 'standard')}
      </Text>
    )
  },
  {
    id: 'priceBuffer',
    accessorFn: (row) => row.priceBuffer,
    header: 'Price Buffer',
    enableSorting: true,
    size: 215,
    cell: ({ row }) => {
      const bufferValue = Number(row.original.priceBuffer.toFixed(2));

      return (
        <Text
          size='13'
          className={cn({
            '!text-red-500': bufferValue < 0,
            '!text-green-400': bufferValue > 0
          })}
        >
          {Format.price(bufferValue, 'standard')}
        </Text>
      );
    }
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
          <a
            href={fullExplorerLink}
            target='_blank'
            rel='noopener noreferrer'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='flex justify-end'>
              <Text
                size='13'
                className='text-primary-11 inline-block max-w-full cursor-pointer truncate border-b border-dotted border-gray-500 leading-none'
              >
                {`${row.original.priceFeed.slice(0, 4)}...${row.original.priceFeed.slice(-4)}`}
              </Text>
            </div>
          </a>
        </HoverCard>
      );
    }
  }
];

const CollateralsPriceTable = ({
  tableData,
  sortType,
  onSelectCollateralRow
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

            const bufferValue = Number(row.priceBuffer.toFixed(2));

            return (
              <div
                key={row.network + index}
                className={cn(
                  'border-secondary-23 grid grid-cols-3 gap-x-10 gap-y-3 border-b p-5 md:gap-x-[63px] md:px-10',
                  {
                    'border-none': dataRows.length - 1 === index
                  }
                )}
                onClick={() =>
                  onSelectCollateralRow(row.network, row.collateral)
                }
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
                      weight='500'
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
                      {row.collateral === NOT_MARKET ? ' - ' : row.collateral}
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
                    {Format.price(row.collateralPrice, 'standard')}
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
                    {Format.price(row.priceRestriction, 'standard')}
                  </Text>
                </div>
                <div className='grid w-full'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14'
                  >
                    Price Buffer
                  </Text>
                  <Text
                    size='13'
                    lineHeight='21'
                    className={cn('truncate', {
                      '!text-red-500': bufferValue < 0,
                      '!text-green-400': bufferValue > 0
                    })}
                  >
                    {Format.price(row.priceBuffer, 'standard')}
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
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Text
                      size='13'
                      lineHeight='21'
                      className='w-fit max-w-[60px] truncate border-b border-dotted border-gray-500'
                    >
                      {sliceAddress(row.priceFeed)}
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
        columns={collateralTableColumns}
        enableSorting={true}
        enablePagination={tableData.length > 10}
        pageSize={10}
        initialSort={{
          id: 'priceBuffer',
          desc: true
        }}
        className={cn('hidden flex-col justify-between lg:flex', {
          'min-h-[565px]': tableData.length > 10
        })}
        headerCellClassName='py-[13px] px-[5px]'
        cellClassName='py-3 px-[5px]'
        headerTextClassName='text-primary-14 font-medium'
        paginationClassName='py-0 px-[5px]'
        tableClassName='table-fixed w-full'
        onRowClick={(row) => onSelectCollateralRow(row.network, row.collateral)}
      />
    </>
  );
};

export default CollateralsPriceTable;
