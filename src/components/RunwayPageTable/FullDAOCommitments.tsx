import React from 'react';

import {
  formatDateWithOrdinal,
  formatLargeNumber
} from '@/shared/lib/utils/utils';
import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';

export interface FullDAOCommitmentRow {
  recipient: string;
  discipline: string;
  token: string;
  amount: number;
  paymentType: string;
  dailyStreamRate: number;
  startDate: string;
  streamEndDate: string;
}

interface FullDAOCommitmentsProps {
  data: FullDAOCommitmentRow[];
}

const columns: ExtendedColumnDef<FullDAOCommitmentRow>[] = [
  {
    accessorKey: 'recipient',
    header: 'Recipient'
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
    header: 'Amount',
    cell: ({ getValue }) => formatLargeNumber(getValue() as number, 1)
  },
  {
    accessorKey: 'paymentType',
    header: 'Payment Type'
  },
  {
    accessorKey: 'dailyStreamRate',
    header: 'Daily Stream Rate',
    align: 'center',
    cell: ({ getValue }) => {
      const value = getValue() as number;
      if (value === 0) {
        return '$0';
      }
      return `$${formatLargeNumber(value, 1)}`;
    }
  },
  {
    accessorKey: 'startDate',
    header: 'Start Date',
    align: 'right',
    cell: ({ getValue }) => formatDateWithOrdinal(getValue() as string)
  },
  {
    accessorKey: 'streamEndDate',
    header: 'Stream End Date',
    align: 'right',
    cell: ({ getValue }) => formatDateWithOrdinal(getValue() as string)
  }
];

const FullDAOCommitments: React.FC<FullDAOCommitmentsProps> = ({ data }) => {
  return (
    <DataTable
      data={data}
      columns={columns}
      pageSize={10}
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

export default FullDAOCommitments;
