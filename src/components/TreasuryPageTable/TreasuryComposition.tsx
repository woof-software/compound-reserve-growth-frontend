import { formatPrice } from '@/shared/lib/utils/utils';
import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';

import { TreasuryCompositionType } from './MOCK_DATA';

interface TreasuryCompositionProps {
  tableData: TreasuryCompositionType[];

  totalBalance: number;
}

const columns: ExtendedColumnDef<TreasuryCompositionType>[] = [
  {
    accessorKey: 'name',
    header: 'Asset',
    cell: ({ row }) => (
      <div className='flex items-center gap-3'>
        <Icon
          name={row.original.icon || 'not-found-icon'}
          className='h-5 w-5'
        />
        <Text size='13'>{row.original.name}</Text>
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

const TreasuryComposition = ({
  tableData,
  totalBalance
}: TreasuryCompositionProps) => {
  return (
    <div className='max-h-[400px] w-full max-w-[522px] overflow-y-auto'>
      <DataTable
        data={tableData}
        columns={columns}
        pageSize={10}
        enableSorting={true}
        headerCellClassName='py-[13px] px-[5px]'
        cellClassName='py-3 px-[5px]'
        headerTextClassName='text-primary-14 font-medium'
      />
      <div className='flex items-center justify-between px-[5px] py-3'>
        <Text
          size='11'
          className='text-primary-14'
        >
          Total Balance
        </Text>
        <Text
          size='11'
          className='text-primary-14'
        >
          {formatPrice(totalBalance, 1)}
        </Text>
      </div>
    </div>
  );
};

export default TreasuryComposition;
