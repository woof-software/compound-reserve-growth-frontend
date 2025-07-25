import React from 'react';

import { cn } from '@/shared/lib/classNames/classNames';
import {
  formatDateWithOrdinal,
  formatLargeNumber
} from '@/shared/lib/utils/utils';
import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';

import { UrlTooltip } from '../UrlTooltip/UrlTooltip';

export interface FullDAOCommitmentRow {
  recipient: string;
  discipline: string;
  token: string;
  amount: number;
  paymentType: string;
  proposalLink: string;
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
    size: 120,
    cell: ({ row }) => {
      const { paymentType, proposalLink } = row.original;

      return (
        <UrlTooltip
          text={paymentType}
          url={proposalLink}
          tooltipClassName='pt-[13px] pb-[8px] pl-[10px] pr-[10px]'
        />
      );
    }
  },
  {
    accessorKey: 'startDate',
    header: 'Start Date',
    align: 'right',
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value ? formatDateWithOrdinal(value) : '-';
    },
    sortingFn: (rowA, rowB) => {
      const dateA = rowA.original.startDate;
      const dateB = rowB.original.startDate;

      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;

      const timeA = new Date(dateA).getTime();
      const timeB = new Date(dateB).getTime();

      return timeA < timeB ? -1 : timeA > timeB ? 1 : 0;
    }
  },
  {
    accessorKey: 'streamEndDate',
    header: 'End Date',
    align: 'right',
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value ? formatDateWithOrdinal(value) : '-';
    },
    sortingFn: (rowA, rowB) => {
      const dateA = rowA.original.streamEndDate;
      const dateB = rowB.original.streamEndDate;

      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;

      const timeA = new Date(dateA).getTime();
      const timeB = new Date(dateB).getTime();

      return timeA < timeB ? -1 : timeA > timeB ? 1 : 0;
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
      initialSort={{ id: 'startDate', desc: true }}
    />
  );
};

export default FullDAOCommitments;
