import React from 'react';

import { formatNumber, formatQuantity } from '@/shared/lib/utils/utils';
import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';

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
    header: 'Provider',
    cell: ({ row }) => (
      <div className='flex items-center gap-3'>
        <Icon
          name={row.original.iconKey}
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
    accessorKey: 'token',
    header: 'Token'
  },
  {
    accessorKey: 'amount',
    header: 'Amount (Qty)',
    cell: ({ getValue }) => formatQuantity(getValue() as number)
  },
  {
    accessorKey: 'value',
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
      <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px]'>
        {formatQuantity(footerData.amount)}
      </td>
      <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px]'>
        {formatNumber(footerData.value)}
      </td>
    </tr>
  );

  return (
    <DataTable
      className='max-w-[627px]'
      data={data}
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
