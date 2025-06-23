import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';

import { CURRENT_INITIATIVES_DATA, CurrentInitiativeProps } from './MOCK_DATA';

const columns: ExtendedColumnDef<CurrentInitiativeProps>[] = [
  {
    accessorKey: 'initiative',
    header: 'Initiative'
  },
  {
    accessorKey: 'discipline',
    header: 'Discipline'
  },
  {
    accessorKey: 'token',
    header: 'Token'
  },
  {
    accessorKey: 'amount',
    header: 'Amount (Qty)'
  },
  {
    accessorKey: 'value',
    header: 'Value ($)'
  }
];

const CurrentInitiatives = () => {
  const footerContent = (
    <>
      <tr>
        <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px]'>
          Total
        </td>
        <td></td>
        <td></td>
        <td></td>
        <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px]'>
          123000
        </td>
      </tr>
      <tr>
        <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px]'>
          Total Expenses Incl. Bug Bounty
        </td>
        <td></td>
        <td></td>
        <td></td>
        <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px]'>
          {' '}
          123000
        </td>
      </tr>
    </>
  );

  return (
    <DataTable
      className='max-w-[627px]'
      data={CURRENT_INITIATIVES_DATA}
      columns={columns}
      pageSize={10}
      footerContent={footerContent}
      headerCellClassName='py-[13px] px-[5px]'
      cellClassName='py-3 px-[5px]'
      headerTextClassName='text-primary-14 font-medium'
    />
  );
};

export default CurrentInitiatives;
