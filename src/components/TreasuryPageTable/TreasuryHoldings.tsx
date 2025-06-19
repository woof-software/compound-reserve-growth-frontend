import { type ColumnDef } from '@tanstack/react-table';

import DataTable from '@/shared/ui/DataTable/DataTable';

import { treasuryData, TreasuryHolding } from './MOCK_DATA';

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
      data={treasuryData}
      columns={treasuryColumns}
      enableSorting
      enablePagination
      pageSize={5}
    />
  );
};

export default TreasuryHoldings;
