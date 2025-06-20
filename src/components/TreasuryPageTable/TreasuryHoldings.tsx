import { type ColumnDef } from '@tanstack/react-table';

import DataTable from '@/shared/ui/DataTable/DataTable';

import { TREASURY_DATA, TreasuryHolding } from './MOCK_DATA';

const treasuryColumns: ColumnDef<TreasuryHolding>[] = [
  {
    accessorKey: 'symbol',
    header: 'Symbol',
    enableSorting: true,
    size: 168
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
    accessorKey: 'wallet',
    header: 'Wallet',
    enableSorting: true
  },
  {
    accessorKey: 'qty',
    header: 'QTY',
    enableSorting: true
  },
  {
    accessorKey: 'value',
    header: 'Value',
    enableSorting: true
  },
  {
    accessorKey: 'price',
    header: 'Price',
    enableSorting: true
  },
  {
    accessorKey: 'apr',
    header: 'APR',
    enableSorting: true
  },
  {
    accessorKey: 'source',
    header: 'Source',
    enableSorting: true
  }
];

const TreasuryHoldings = () => {
  return (
    <DataTable
      data={TREASURY_DATA}
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
