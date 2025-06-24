import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import Icon from '@/shared/ui/Icon/Icon';

import {
  COMPOUND_FEE_REVENUE_DATA,
  CompoundFeeRevenueProps
} from './MOCK_DATA';

const columns: ExtendedColumnDef<CompoundFeeRevenueProps>[] = [
  {
    accessorKey: 'chain',
    header: 'Chain',
    cell: ({ getValue }) => (
      <div className='flex items-center gap-2'>
        <Icon
          name='not-found-icon'
          className='h-5 w-5'
        />
        <span>{getValue() as string}</span>
      </div>
    )
  },
  {
    accessorKey: 'q3_2024',
    header: 'Q3 2024'
  },
  {
    accessorKey: 'q4_2024',
    header: 'Q4 2024'
  },
  {
    accessorKey: 'q1_2025',
    header: 'Q1 2025'
  },
  {
    accessorKey: 'q2_2025',
    header: 'Q2 2025'
  }
];

const CompoundFeeRevenuebyChain = () => {
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
      data={COMPOUND_FEE_REVENUE_DATA}
      columns={columns}
      pageSize={10}
      footerContent={footerRow}
      headerCellClassName='py-[13px] px-[5px]'
      cellClassName='py-3 px-[5px]'
      headerTextClassName='text-primary-14 font-medium'
    />
  );
};

export default CompoundFeeRevenuebyChain;
