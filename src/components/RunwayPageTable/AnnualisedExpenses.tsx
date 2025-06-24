import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';

import { ANNUALISED_EXPENSES_DATA, AnnualisedExpensesProps } from './MOCK_DATA';

const columns: ExtendedColumnDef<AnnualisedExpensesProps>[] = [
  {
    accessorKey: 'discipline',
    header: 'Discipline'
  },
  {
    accessorKey: 'compound',
    header: 'Compound'
  },
  {
    accessorKey: 'stablecoins',
    header: 'Stablecoins'
  },
  {
    accessorKey: 'eth',
    header: 'ETH'
  },
  {
    accessorKey: 'value',
    header: 'Value ($)'
  }
];

const AnnualisedExpenses = () => {
  const footerRow = (
    <tr>
      <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px]'>
        Total
      </td>
      <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px]'>
        123000
      </td>
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
      data={ANNUALISED_EXPENSES_DATA}
      columns={columns}
      pageSize={10}
      footerContent={footerRow}
      headerCellClassName='py-[13px] px-[5px]'
      cellClassName='py-3 px-[5px]'
      headerTextClassName='text-primary-14 font-medium'
    />
  );
};

export default AnnualisedExpenses;
