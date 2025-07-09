import React from 'react';

import { formatNumber, formatQuantity } from '@/shared/lib/utils/utils';
import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';

export interface CurrentInitiativeRow {
  initiative: string;
  discipline: string;
  token: string;
  amount: number;
  value: number;
}

interface CurrentInitiativesFooter {
  totalValue: number;
  totalValueWithBounty: number;
}

interface CurrentInitiativesProps {
  data: CurrentInitiativeRow[];
  footerData: CurrentInitiativesFooter;
}

const columns: ExtendedColumnDef<CurrentInitiativeRow>[] = [
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
    header: 'Amount (Qty)',
    cell: ({ getValue }) => formatQuantity(getValue() as number)
  },
  {
    accessorKey: 'value',
    header: 'Value ($)',
    cell: ({ getValue }) => formatNumber(getValue() as number)
  }
];

const CurrentInitiatives: React.FC<CurrentInitiativesProps> = ({
  data,
  footerData
}) => {
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
          {formatNumber(footerData.totalValue)}
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
          {formatNumber(footerData.totalValueWithBounty)}
        </td>
      </tr>
    </>
  );

  return (
    <DataTable
      className='max-w-[627px]'
      data={data}
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
