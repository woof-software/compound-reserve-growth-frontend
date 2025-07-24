import React from 'react';

import { cn } from '@/shared/lib/classNames/classNames';
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
  status: string;
  paidAmount: number;
  percentagePaid: number;
}

interface FullDAOCommitmentsProps {
  data: FullDAOCommitmentRow[];
}

const columns: ExtendedColumnDef<FullDAOCommitmentRow>[] = [
  {
    accessorKey: 'recipient',
    header: 'Recipient',
    cell: ({ getValue }) => (getValue() as string) || '-'
  },
  {
    accessorKey: 'discipline',
    header: 'Discipline',
    cell: ({ getValue }) => (getValue() as string) || '-'
  },
  {
    accessorKey: 'status',
    header: 'Status',
    align: 'center',
    cell: ({ getValue }) => {
      const status = getValue() as string;
      if (!status) return '-';
      return status.charAt(0).toUpperCase() + status.slice(1);
    }
  },
  {
    accessorKey: 'amount',
    header: 'Total Amount',
    align: 'center',
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return value === null || value === undefined
        ? '-'
        : `$${formatLargeNumber(value, 2)}`;
    }
  },
  {
    accessorKey: 'paidAmount',
    header: 'Paid Amount',
    align: 'center',
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return value === null || value === undefined
        ? '-'
        : `$${formatLargeNumber(value, 2)}`;
    }
  },
  {
    accessorKey: 'percentagePaid',
    header: '% Paid',
    align: 'center',
    cell: ({ getValue }) => {
      const value = getValue() as number;
      if (value === null || value === undefined) return '-';
      const percentage = value * 100;
      return `${percentage.toFixed(2)}%`;
    }
  },
  {
    accessorKey: 'paymentType',
    header: 'Payment Type',
    align: 'center',
    cell: ({ getValue }) => (getValue() as string) || '-'
  },
  {
    accessorKey: 'startDate',
    header: 'Start Date',
    align: 'right',
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value ? formatDateWithOrdinal(value) : '-';
    }
  },
  {
    accessorKey: 'streamEndDate',
    header: 'End Date',
    align: 'right',
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value ? formatDateWithOrdinal(value) : '-';
    }
  }
];

const FullDAOCommitments: React.FC<FullDAOCommitmentsProps> = ({ data }) => {
  return (
    <DataTable
      data={data}
      columns={columns}
      pageSize={10}
      className={cn('flex flex-col justify-between', {
        'min-h-[565px]': data.length > 10
      })}
      containerTableClassName='min-h-[473px]'
      headerCellClassName='py-[13px] px-[5px]'
      cellClassName='py-3 px-[5px]'
      headerTextClassName='text-primary-14 font-medium'
      enableSorting
      enablePagination
      paginationClassName='py-[13px] px-[5px]'
      initialSort={{ id: 'amount', desc: true }}
    />
  );
};

export default FullDAOCommitments;
