import React, { useMemo } from 'react';

import { MobileDataTable } from '@/components/MobileDataTable/MobileDataTable';
import { cn } from '@/shared/lib/classNames/classNames';
import {
  capitalizeFirstLetter,
  formatDateWithOrdinal,
  formatLargeNumber
} from '@/shared/lib/utils/utils';
import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import Text from '@/shared/ui/Text/Text';

import { TextTooltip } from '../TextTooltip/TextTooltip';
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

  sortType: { key: string; type: string };
}

const columns: ExtendedColumnDef<FullDAOCommitmentRow>[] = [
  {
    accessorKey: 'recipient',
    header: 'Recipient',
    // cell: ({ getValue }) => (getValue() as string) || '-'
    size: 150,
    cell: ({ getValue }) => {
      const initiative = (getValue() as string) || '-';
      const maxLength = 20;

      if (initiative.length > maxLength) {
        return (
          <TextTooltip
            text={initiative}
            triggerWidth={120}
          />
        );
      }

      return <Text size='13'>{initiative}</Text>;
    }
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

const FullDAOCommitments: React.FC<FullDAOCommitmentsProps> = ({
  data,
  sortType
}) => {
  const mobileTableData = useMemo(() => {
    if (!sortType?.key) {
      return data;
    }

    const key = sortType.key as keyof FullDAOCommitmentRow;
    return [...data].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortType.type === 'asc' ? aVal - bVal : bVal - aVal;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortType.type === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return 0;
    });
  }, [data, sortType]);

  return (
    <>
      <MobileDataTable tableData={mobileTableData}>
        {(dataRows) =>
          dataRows.map((row, index) => (
            <div
              key={row.token + index}
              className='border-secondary-23 grid grid-cols-3 gap-x-10 gap-y-3 border-b p-5 md:gap-x-[63px] md:px-10'
            >
              <div className='grid w-full max-w-[73px]'>
                <Text
                  size='8'
                  lineHeight='18'
                  weight='500'
                  className='text-primary-14'
                >
                  Recipient
                </Text>
                <Text
                  size='11'
                  lineHeight='21'
                  className='truncate'
                >
                  {row.recipient}
                </Text>
              </div>
              <div className='grid w-full max-w-[73px]'>
                <Text
                  size='8'
                  lineHeight='18'
                  weight='500'
                  className='text-primary-14'
                >
                  Discipline
                </Text>
                <Text
                  size='11'
                  lineHeight='21'
                  className='truncate'
                >
                  {row.discipline}
                </Text>
              </div>
              <div className='grid w-full max-w-[73px]'>
                <Text
                  size='8'
                  lineHeight='18'
                  weight='500'
                  className='text-primary-14'
                >
                  Status
                </Text>
                <Text
                  size='11'
                  lineHeight='21'
                  className='truncate'
                >
                  {capitalizeFirstLetter(row.status, '-')}
                </Text>
              </div>
              <div className='grid w-full max-w-[73px]'>
                <Text
                  size='8'
                  lineHeight='18'
                  weight='500'
                  className='text-primary-14'
                >
                  Total Amount
                </Text>
                <Text
                  size='11'
                  lineHeight='21'
                  className='truncate'
                >
                  {row.amount ? `$${formatLargeNumber(row.amount, 2)}` : '-'}
                </Text>
              </div>
              <div className='grid w-full max-w-[73px]'>
                <Text
                  size='8'
                  lineHeight='18'
                  weight='500'
                  className='text-primary-14'
                >
                  Paid Amount
                </Text>
                <Text
                  size='11'
                  lineHeight='21'
                  className='truncate'
                >
                  {row.amount
                    ? `$${formatLargeNumber(row.paidAmount, 2)}`
                    : '-'}
                </Text>
              </div>
              <div className='grid w-full max-w-[73px]'>
                <Text
                  size='8'
                  lineHeight='18'
                  weight='500'
                  className='text-primary-14'
                >
                  % Paid
                </Text>
                <Text
                  size='11'
                  lineHeight='21'
                  className='truncate'
                >
                  {row.percentagePaid
                    ? `${(row.percentagePaid * 100).toFixed(2)}%`
                    : '-'}
                </Text>
              </div>
              <div className='grid w-full max-w-[73px]'>
                <Text
                  size='8'
                  lineHeight='18'
                  weight='500'
                  className='text-primary-14'
                >
                  Payment Type
                </Text>
                <Text
                  size='11'
                  lineHeight='21'
                  className='truncate'
                >
                  {row.paymentType}
                </Text>
              </div>
              <div className='grid w-full max-w-[73px]'>
                <Text
                  size='8'
                  lineHeight='18'
                  weight='500'
                  className='text-primary-14'
                >
                  Start Date
                </Text>
                <Text
                  size='11'
                  lineHeight='21'
                  className='truncate'
                >
                  {row.startDate ? formatDateWithOrdinal(row.startDate) : '-'}
                </Text>
              </div>
              <div className='grid w-full max-w-[73px]'>
                <Text
                  size='8'
                  lineHeight='18'
                  weight='500'
                  className='text-primary-14'
                >
                  End Date
                </Text>
                <Text
                  size='11'
                  lineHeight='21'
                  className='truncate'
                >
                  {row.streamEndDate
                    ? formatDateWithOrdinal(row.streamEndDate)
                    : '-'}
                </Text>
              </div>
            </div>
          ))
        }
      </MobileDataTable>
      <div className='hidden w-full max-w-full lg:block'>
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
      </div>
    </>
  );
};

export default FullDAOCommitments;
