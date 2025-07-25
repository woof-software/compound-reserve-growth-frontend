import React from 'react';

import { formatNumber, formatQuantity } from '@/shared/lib/utils/utils';
import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';

export interface ProviderRow {
  provider: string;
  iconKey: string;
  discipline: string;
  token: string;
  amount: number;
  value: number;
}

interface ProviderFooter {
  amount: number;
  value: number;
}

interface CurrentServiceProvidersProps {
  data: ProviderRow[];
  footerData: ProviderFooter;
}

const columns: ExtendedColumnDef<ProviderRow>[] = [
  {
    accessorKey: 'provider',
    header: 'Provider'
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
    header: 'Amount (Qty)',
    align: 'center',
    cell: ({ getValue }) => formatQuantity(getValue() as number)
  },
  {
    accessorKey: 'value',
    align: 'right',
    header: 'Value ($)',
    cell: ({ getValue }) => formatNumber(getValue() as number)
  }
];

const CurrentServiceProviders: React.FC<CurrentServiceProvidersProps> = ({
  data,
  footerData
}) => {
  const footerRow = (
    <tr>
      <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px]'>
        Total
      </td>
      <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px]'></td>
      <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px]'></td>
      <td className='text-primary-14 px-[5px] py-[13px] text-center text-[13px]'></td>
      <td className='text-primary-14 px-[5px] py-[13px] text-right text-[13px]'>
        {formatNumber(footerData.value)}
      </td>
    </tr>
  );

  return (
    <DataTable
      data={data}
      columns={columns}
      pageSize={5}
      footerContent={footerRow}
      containerTableClassName='min-h-[372px]'
      className='flex min-h-[400px] flex-col justify-between'
      headerCellClassName='py-[13px] px-[5px]'
      cellClassName='py-3 px-[5px]'
      headerTextClassName='text-primary-14 font-medium'
      enableSorting
      enablePagination
      paginationClassName='py-[13px] px-[5px]'
    />
  );
};

export default CurrentServiceProviders;
