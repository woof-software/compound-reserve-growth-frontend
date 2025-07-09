import React from 'react';

import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import {
  formatDateWithOrdinal,
  formatLargeNumber
} from '@/shared/lib/utils/utils';

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
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return value === 0 ? '0' : formatLargeNumber(value, 1);
    }
  },
  {
    accessorKey: 'startDate',
    header: 'Start Date',
    cell: ({ getValue }) => formatDateWithOrdinal(getValue() as string)
  },
  {
    accessorKey: 'streamEndDate',
    header: 'Stream End Date',
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
    />
  );
};

export default FullDAOCommitments;
