import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';

import {
  TREASURY_COMPOSITION_DATA,
  TreasuryCompositionType
} from './MOCK_DATA';

const columns: ExtendedColumnDef<TreasuryCompositionType>[] = [
  {
    accessorKey: 'name',
    header: 'Asset',
    cell: ({ row }) => (
      <div className='flex items-center gap-3'>
        <Icon
          // name={row.original.icon}
          name='not-found-icon'
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
        {row.original.balance}
      </Text>
    )
  }
];

const TreasuryComposition = () => {
  return (
    <div className='w-full max-w-[522px]'>
      <DataTable
        data={TREASURY_COMPOSITION_DATA}
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
          $300,526,146
        </Text>
      </div>
    </div>
  );
};

export default TreasuryComposition;
