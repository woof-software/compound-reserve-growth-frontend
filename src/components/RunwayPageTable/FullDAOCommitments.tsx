import { Format } from '@/shared/lib/utils/numbersFormatter';
import React, { useMemo } from 'react';

import { MobileDataTable } from '@/components/MobileDataTable/MobileDataTable';
import { SortAdapter } from '@/shared/hooks/useSorting';
import { cn } from '@/shared/lib/classNames/classNames';
import { dateSortingFn, parseDateToUTC } from '@/shared/lib/utils/dateSorting';
import {
  capitalizeFirstLetter,
  formatDateWithOrdinal,
  formatLargeNumber
} from '@/shared/lib/utils/utils';
import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import Text from '@/shared/ui/Text/Text';
import { TextTooltip } from '@/shared/ui/TextTooltip/TextTooltip';

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

  sortType: SortAdapter<FullDAOCommitmentRow>;
}

const columns: ExtendedColumnDef<FullDAOCommitmentRow>[] = [
  {
    accessorKey: 'recipient',
    header: 'Recipient',
    size: 150,
    cell: ({ getValue }) => {
      const initiative = (getValue() as string) || '-';
      const maxLength = 20;

      if (initiative.length > maxLength) {
        return (
          <TextTooltip
            className={{
              text: '!font-medium'
            }}
            text={initiative}
            triggerWidth={120}
          />
        );
      }

      return (
        <Text
          size='13'
          weight='500'
        >
          {initiative}
        </Text>
      );
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
        : Format.price(value, 'standard');
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
        : Format.price(value, 'standard');
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
    sortingFn: dateSortingFn((row) => row.original.startDate)
  },
  {
    accessorKey: 'streamEndDate',
    header: 'End Date',
    align: 'right',
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value ? formatDateWithOrdinal(value) : '-';
    },
    sortingFn: dateSortingFn((row) => row.original.streamEndDate)
  }
];

const FullDAOCommitments: React.FC<FullDAOCommitmentsProps> = ({
  data,
  sortType
}) => {
  const mobileTableData = useMemo(() => {
    if (!sortType?.key) return data;

    const key = sortType.key as keyof FullDAOCommitmentRow;

    return [...data].sort((a, b) => {
      const asc = sortType.type === 'asc';

      if (typeof a[key] === 'number' && typeof b[key] === 'number') {
        const diff = (a[key] as number) - (b[key] as number);
        return asc ? diff : -diff;
      }

      if (key === 'startDate' || key === 'streamEndDate') {
        const ta = parseDateToUTC(a[key] as string | undefined);
        const tb = parseDateToUTC(b[key] as string | undefined);

        const badA = Number.isNaN(ta);
        const badB = Number.isNaN(tb);
        if (badA && badB) return 0;
        if (badA) return asc ? 1 : -1;
        if (badB) return asc ? -1 : 1;

        const diff = ta - tb;
        return asc ? diff : -diff;
      }

      if (typeof a[key] === 'string' && typeof b[key] === 'string') {
        const diff = (a[key] as string).localeCompare(b[key] as string);
        return asc ? diff : -diff;
      }

      return 0;
    });
  }, [data, sortType]);

  return (
    <>
      <MobileDataTable tableData={mobileTableData}>
        {(dataRows) =>
          dataRows.map((row, index) => {
            return (
              <div
                key={row.token + index}
                className={cn(
                  'border-secondary-23 grid grid-cols-3 gap-x-10 gap-y-3 border-b p-5 md:gap-x-[63px] md:px-10',
                  {
                    'border-none': index === dataRows.length - 1
                  }
                )}
              >
                <div className='grid w-full max-w-[100px]'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14'
                  >
                    Recipient
                  </Text>
                  <Text
                    size='13'
                    lineHeight='21'
                    className='truncate'
                  >
                    {row.recipient}
                  </Text>
                </div>
                <div className='grid w-full max-w-[100px]'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14'
                  >
                    Discipline
                  </Text>
                  <Text
                    size='13'
                    lineHeight='21'
                    className='truncate'
                  >
                    {row.discipline}
                  </Text>
                </div>
                <div className='grid w-full max-w-[100px]'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14'
                  >
                    Status
                  </Text>
                  <Text
                    size='13'
                    lineHeight='21'
                    className='truncate'
                  >
                    {capitalizeFirstLetter(row.status, '-')}
                  </Text>
                </div>
                <div className='grid w-full max-w-[100px]'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14'
                  >
                    Total Amount
                  </Text>
                  <Text
                    size='13'
                    lineHeight='21'
                    className='truncate'
                  >
                    {row.amount ? `$${formatLargeNumber(row.amount, 2)}` : '-'}
                  </Text>
                </div>
                <div className='grid w-full max-w-[100px]'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14'
                  >
                    Paid Amount
                  </Text>
                  <Text
                    size='13'
                    lineHeight='21'
                    className='truncate'
                  >
                    {row.amount
                      ? `$${formatLargeNumber(row.paidAmount, 2)}`
                      : '-'}
                  </Text>
                </div>
                <div className='grid w-full max-w-[100px]'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14'
                  >
                    % Paid
                  </Text>
                  <Text
                    size='13'
                    lineHeight='21'
                    className='truncate'
                  >
                    {row.percentagePaid
                      ? `${(row.percentagePaid * 100).toFixed(2)}%`
                      : '-'}
                  </Text>
                </div>
                <div className='grid w-full max-w-[100px]'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14'
                  >
                    Payment Type
                  </Text>
                  <a
                    href={row.proposalLink}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <Text
                      size='13'
                      lineHeight='21'
                      className='w-fit max-w-[60px] truncate border-b border-dotted border-gray-500'
                    >
                      {row.paymentType}
                    </Text>
                  </a>
                </div>
                <div className='grid w-full max-w-[100px]'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14'
                  >
                    Start Date
                  </Text>
                  <Text
                    size='13'
                    lineHeight='21'
                    className='truncate'
                  >
                    {row.startDate ? formatDateWithOrdinal(row.startDate) : '-'}
                  </Text>
                </div>
                <div className='grid w-full max-w-[100px]'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14'
                  >
                    End Date
                  </Text>
                  <Text
                    size='13'
                    lineHeight='21'
                    className='truncate'
                  >
                    {row.streamEndDate
                      ? formatDateWithOrdinal(row.streamEndDate)
                      : '-'}
                  </Text>
                </div>
              </div>
            );
          })
        }
      </MobileDataTable>
      <div className='hidden w-full max-w-full lg:block'>
        <DataTable
          data={data}
          columns={columns}
          pageSize={10}
          className={cn('flex flex-col justify-between', {
            'min-h-[505px]': data.length > 10
          })}
          containerTableClassName='min-h-[473px]'
          headerCellClassName='py-[13px] px-[5px]'
          cellClassName='py-3 px-[5px]'
          headerTextClassName='text-primary-14 font-medium'
          enableSorting
          enablePagination={data.length > 10}
          paginationClassName='py-0 px-[5px]'
          initialSort={{ id: 'startDate', desc: true }}
        />
      </div>
    </>
  );
};

export default FullDAOCommitments;
