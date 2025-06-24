import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';

import { PROVIDER_DATA, ProviderProps } from './MOCK_DATA';

const columns: ExtendedColumnDef<ProviderProps>[] = [
  {
    accessorKey: 'provider',
    header: 'Provider',
    cell: ({ row }) => (
      <div className='flex items-center gap-3'>
        <Icon
          name='not-found-icon'
          className='h-5 w-5'
        />
        <Text size='13'>{row.original.provider}</Text>
      </div>
    )
  },
  {
    accessorKey: 'discipline',
    header: 'Discipline'
  },
  {
    accessorKey: 'compound',
    header: 'Compound'
  },
  {
    accessorKey: 'stablecoin',
    header: 'Stablecoin'
  },
  {
    accessorKey: 'value',
    header: 'Value ($)'
  }
];

const CurrentServiceProviders = () => {
  const footerRow = (
    <tr>
      <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px]'>
        Total
      </td>
      <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px]'></td>
      <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px]'>
        123000
      </td>
      <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px]'>
        123000
      </td>
      <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px]'>
        123000
      </td>
    </tr>
  );

  return (
    <DataTable
      className='max-w-[627px]'
      data={PROVIDER_DATA}
      columns={columns}
      pageSize={10}
      footerContent={footerRow}
      headerCellClassName='py-[13px] px-[5px]'
      cellClassName='py-3 px-[5px]'
      headerTextClassName='text-primary-14 font-medium'
    />
  );
};

export default CurrentServiceProviders;
