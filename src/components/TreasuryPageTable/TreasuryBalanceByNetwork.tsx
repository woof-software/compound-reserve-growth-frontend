import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';

import {
  TREASURY_BALANCE_BY_NETWORK,
  TreasuryBalanceByNetworkProps
} from './MOCK_DATA';

const treasuryColumns: ExtendedColumnDef<TreasuryBalanceByNetworkProps>[] = [
  {
    accessorKey: 'symbol',
    header: 'Symbol',
    enableSorting: true,
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
    accessorKey: 'qty',
    header: 'QTY',
    align: 'right',
    enableSorting: true
  },
  {
    accessorKey: 'value',
    align: 'right',
    header: 'Value',
    enableSorting: true
  },
  {
    accessorKey: 'apr',
    header: 'APR',
    align: 'right',
    enableSorting: true
  },
  {
    accessorKey: 'source',
    header: 'Source',
    align: 'right',
    enableSorting: true
  }
];

const TreasuryBalanceByNetwork = () => {
  return (
    <div className='w-full max-w-[522px]'>
      <DataTable
        data={TREASURY_BALANCE_BY_NETWORK}
        columns={treasuryColumns}
        enableSorting
        enablePagination
        pageSize={10}
        headerCellClassName='py-[13px] px-[5px]'
        cellClassName='py-3 px-[5px]'
        headerTextClassName='text-primary-14 font-medium'
        paginationClassName='py-[13px] px-[5px]'
      />
    </div>
  );
};

export default TreasuryBalanceByNetwork;
