import { type ColumnDef } from '@tanstack/react-table';

import { formatLargeNumber } from '@/shared/lib/utils/utils';
import DataTable from '@/shared/ui/DataTable/DataTable';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';

import { TreasuryHolding } from './MOCK_DATA';

const treasuryColumns: ColumnDef<TreasuryHolding>[] = [
  {
    accessorKey: 'symbol',
    header: 'Symbol',
    enableSorting: true,
    size: 168,
    cell: ({ row }) => (
      <div className='flex items-center gap-3'>
        <Icon
          name='not-found-icon'
          className='h-5 w-5'
        />
        <Text size='13'>{row.original.symbol}</Text>
      </div>
    )
  },
  {
    accessorKey: 'chain',
    header: 'Chain',
    enableSorting: true
  },
  {
    accessorKey: 'market',
    header: 'Market',
    enableSorting: true
  },
  {
    accessorKey: 'qty',
    header: 'QTY',
    enableSorting: true,
    cell: ({ row }) => (
      <Text size='13'>{formatLargeNumber(row.original.qty, 1)}</Text>
    )
  },
  {
    accessorKey: 'value',
    header: 'Value',
    enableSorting: true,
    cell: ({ row }) => (
      <Text size='13'>{formatLargeNumber(row.original.value, 1)}</Text>
    )
  },
  {
    accessorKey: 'price',
    header: 'Price',
    enableSorting: true,
    cell: ({ row }) => (
      <Text size='13'>{formatLargeNumber(row.original.price, 1)}</Text>
    )
  },
  {
    accessorKey: 'source',
    header: 'Source',
    enableSorting: true
  }
];

interface TreasuryHoldingsProps {
  tableData: TreasuryHolding[];
}

const TreasuryHoldings = ({ tableData }: TreasuryHoldingsProps) => {
  return (
    <DataTable
      data={tableData}
      columns={treasuryColumns}
      enableSorting
      enablePagination
      pageSize={10}
      headerCellClassName='py-[13px] px-[5px]'
      cellClassName='py-3 px-[5px]'
      headerTextClassName='text-primary-14 font-medium'
      paginationClassName='py-[13px] px-[5px]'
    />
  );
};

export default TreasuryHoldings;
