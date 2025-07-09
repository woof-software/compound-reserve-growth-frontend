import React from 'react';

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
    cell: ({ getValue }) =>
      (getValue() as number).toLocaleString(undefined, {
        maximumFractionDigits: 0
      })
  },
  {
    accessorKey: 'value',
    header: 'Value ($)',
    align: 'right',
    cell: ({ getValue }) =>
      `$${(getValue() as number).toLocaleString(undefined, {
        maximumFractionDigits: 0
      })}`
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
      <td className='text-primary-14 px-[5px] py-[13px] text-center text-[13px]'></td>
      <td className='text-primary-14 px-[5px] py-[13px] text-right text-[13px]'>
        {`$${footerData.value.toLocaleString(undefined, {
          maximumFractionDigits: 0
        })}`}
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
      initialSort={{ id: 'value', desc: true }}
    />
  );
};

export default AnnualisedExpenses;
