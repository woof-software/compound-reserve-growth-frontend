import React from 'react';

import { formatLargeNumber } from '@/shared/lib/utils/utils';
import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';

export interface AnnualisedExpensesRow {
  discipline: string;
  token: string;
  amount: number;
  value: number;
}

interface AnnualisedExpensesFooter {
  amount: number;
  value: number;
}

interface AnnualisedExpensesComponentProps {
  data: AnnualisedExpensesRow[];
  footerData: AnnualisedExpensesFooter;
}

const columns: ExtendedColumnDef<AnnualisedExpensesRow>[] = [
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
    header: 'Amount (Qty)',
    align: 'center',
    cell: ({ getValue }) => formatLargeNumber(getValue() as number, 2)
  },
  {
    accessorKey: 'value',
    header: 'Value ($)',
    align: 'right',
    cell: ({ getValue }) => `$${formatLargeNumber(getValue() as number, 2)}`
  }
];

const AnnualisedExpenses: React.FC<AnnualisedExpensesComponentProps> = ({
  data,
  footerData
}) => {
  const footerRow = (
    <tr>
      <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px]'>
        Total
      </td>
      <td className='text-primary-14 px-[5px] py-[13px] text-right text-[13px]'></td>
      <td className='text-primary-14 px-[5px] py-[13px] text-center text-[13px]'>
        {formatLargeNumber(footerData.amount, 2)}
      </td>
      <td className='text-primary-14 px-[5px] py-[13px] text-right text-[13px]'>
        {`$${formatLargeNumber(footerData.value, 2)}`}
      </td>
    </tr>
  );

  return (
    <DataTable
      data={data}
      columns={columns}
      pageSize={10}
      footerContent={footerRow}
      headerCellClassName='py-[13px] px-[5px]'
      cellClassName='py-3 px-[5px]'
      headerTextClassName='text-primary-14 font-medium'
      enableSorting
      enablePagination
      paginationClassName='py-[13px] px-[5px]'
      className='flex min-h-[400px] flex-col justify-between'
    />
  );
};

export default AnnualisedExpenses;
