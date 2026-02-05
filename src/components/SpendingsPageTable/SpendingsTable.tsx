import React, { useMemo } from 'react';

import { MobileDataTable } from '@/components/MobileDataTable/MobileDataTable';
import { cn } from '@/shared/lib/classNames/classNames';
import { Format } from '@/shared/lib/utils/numbersFormatter';
import { formatDateWithOrdinal } from '@/shared/lib/utils/utils';
import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import { UrlTooltip } from '@/components/UrlTooltip/UrlTooltip';
import Text from '@/shared/ui/Text/Text';
import { TextTooltip } from '@/shared/ui/TextTooltip/TextTooltip';
import { Tooltip } from '@/shared/ui/Tooltip/Tooltip';

import type { SpendingsRow } from '@/entities/Spendings/data/spendingsData';

interface SpendingsTableProps {
  data: SpendingsRow[];
  allocateHeader: string;
  totalAllocate: number;
}

const getCompactCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '-';

  return Format.price(value, 'compact');
};

const renderCompactCurrency = (
  value: number | null | undefined,
  className?: string
) => {
  if (value === null || value === undefined) return '-';

  const compactValue = getCompactCurrency(value);
  const fullValue = Format.price(value, 'standard');

  return (
    <Tooltip content={fullValue}>
      <span
        className={cn(
          'text-primary-11 inline-flex cursor-default items-center whitespace-nowrap tabular-nums',
          className
        )}
      >
        {compactValue}
      </span>
    </Tooltip>
  );
};

const formatDateLabel = (value: string | null | undefined) => {
  if (!value) return '-';
  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? value : formatDateWithOrdinal(value);
};

const formatDateShort = (value: string | null | undefined) => {
  if (!value) return '-';
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return value;
  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const createSpendingsColumns = (
  allocateHeader: string
): ExtendedColumnDef<SpendingsRow>[] => [
  {
        accessorKey: 'counterpartyService',
        header: 'Counterparty / Service',
        enableSorting: true,
        size: 320,
        cell: ({ row }) => {
          const value = row.original.counterpartyService || '-';
          const notesValue = row.original.notes || '';
          return (
            <div className='flex min-w-0 flex-col gap-1'>
              {value.length > 28 ? (
                <TextTooltip
                  text={value}
                  triggerWidth={210}
                  className={{ text: '!font-normal' }}
                />
              ) : (
                <Text
                  size='12'
                  className='whitespace-normal leading-5'
                >
                  {value}
                </Text>
              )}
              {notesValue ? (
                <Text
                  size='11'
                  weight='500'
                  className='text-primary-14 line-clamp-1 leading-4'
                  title={notesValue}
                >
                  {notesValue}
                </Text>
              ) : null}
            </div>
          );
        }
  },
  {
        accessorKey: 'contractValue',
        header: 'Contract',
        align: 'left',
        enableSorting: false,
        size: 170,
        cell: ({ row }) => (
          <div className='flex flex-col items-start gap-1'>
            <Text
              size='12'
              className='tabular-nums'
            >
              {renderCompactCurrency(row.original.contractValue, 'text-[12px]')}
            </Text>
            <Text
              size='11'
              weight='500'
              className='text-primary-14 max-w-full truncate whitespace-nowrap leading-4'
            >
              {formatDateShort(row.original.contractStartDate)} –{' '}
              {formatDateShort(row.original.contractEndDate)}
            </Text>
          </div>
        )
  },
  {
        accessorKey: 'allocate',
        header: allocateHeader,
        align: 'left',
        enableSorting: false,
        size: 160,
        cell: ({ getValue }) => {
          const value = getValue() as number | null;
          return renderCompactCurrency(value, 'text-[12px]');
        }
  },
  {
        accessorKey: 'renewalExpiry',
        header: 'Renewal / Status',
        align: 'left',
        enableSorting: true,
        size: 190,
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Text
              size='12'
              weight='500'
              className='tabular-nums'
            >
              {formatDateLabel(row.original.renewalExpiry)}
            </Text>
            <span className='bg-secondary-23/30 text-primary-14 rounded-md px-2 py-0.5 text-[10px] leading-4 font-medium'>
              {row.original.status || '-'}
            </span>
          </div>
        )
      },
      {
        id: 'details',
        header: 'Details',
        accessorFn: (row) => row.activeDaysInFY ?? null,
        enableSorting: true,
        size: 170,
        cell: ({ row }) => (
          <div className='flex min-h-[22px] items-center gap-2.5'>
            {row.original.lastRenewalProposalUrl ? (
              <a
                href={row.original.lastRenewalProposalUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='bg-secondary-23/30 text-primary-14 inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] leading-4 font-medium'
              >
                {row.original.lastRenewalProposalLabel || 'Proposal'}
              </a>
            ) : null}
            <Text
              size='12'
              weight='500'
              className='text-primary-14/70 truncate'
            >
              {row.original.activeDaysInFY ?? '-'}d
            </Text>
          </div>
        )
  }
];

const SpendingsTable: React.FC<SpendingsTableProps> = ({
  data,
  allocateHeader,
  totalAllocate
}) => {
  const columns = useMemo(
    () => createSpendingsColumns(allocateHeader),
    [allocateHeader]
  );

  return (
    <>
      <MobileDataTable tableData={data}>
        {(dataRows) => (
          <>
            {dataRows.map((row, index) => (
              <div
                key={`${row.number}-${row.counterpartyService}-${index}`}
                className={cn(
                  'border-secondary-23 grid grid-cols-2 gap-x-10 gap-y-3 border-b p-5 md:gap-x-[63px] md:px-10',
                  {
                    'border-b-0': dataRows.length - 1 === index
                  }
                )}
              >
                <div className='grid w-full'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14'
                  >
                    Number
                  </Text>
                  <Text
                    size='13'
                    lineHeight='21'
                    className='truncate'
                  >
                    {row.number}
                  </Text>
                </div>
                <div className='grid w-full'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14'
                  >
                    Counterparty / Service
                  </Text>
                  <Text
                    size='13'
                    lineHeight='21'
                    className='truncate'
                  >
                    {row.counterpartyService}
                  </Text>
                </div>
                <div className='grid w-full'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14'
                  >
                    Contract Value
                  </Text>
                  <Text
                    size='13'
                    lineHeight='21'
                    className='truncate tabular-nums'
                    title={
                      row.contractValue === null || row.contractValue === undefined
                        ? undefined
                        : Format.price(row.contractValue, 'standard')
                    }
                  >
                    {getCompactCurrency(row.contractValue)}
                  </Text>
                </div>
                <div className='grid w-full'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14'
                  >
                    Contract Start Date
                  </Text>
                  <Text
                    size='13'
                    lineHeight='21'
                    className='truncate'
                  >
                    {formatDateLabel(row.contractStartDate)}
                  </Text>
                </div>
                <div className='grid w-full'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14'
                  >
                    Contract End Date
                  </Text>
                  <Text
                    size='13'
                    lineHeight='21'
                    className='truncate'
                  >
                    {formatDateLabel(row.contractEndDate)}
                  </Text>
                </div>
                <div className='grid w-full'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14'
                  >
                    Active Days in FY
                  </Text>
                  <Text
                    size='13'
                    lineHeight='21'
                    className='truncate'
                  >
                    {row.activeDaysInFY ?? '-'}
                  </Text>
                </div>
                <div className='grid w-full'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14'
                  >
                    {allocateHeader}
                  </Text>
                  <Text
                    size='13'
                    lineHeight='21'
                    className='truncate tabular-nums'
                    title={
                      row.allocate === null || row.allocate === undefined
                        ? undefined
                        : Format.price(row.allocate, 'standard')
                    }
                  >
                    {getCompactCurrency(row.allocate)}
                  </Text>
                </div>
                <div className='grid w-full'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14'
                  >
                    Renewal / Expiry
                  </Text>
                  <Text
                    size='13'
                    lineHeight='21'
                    className='truncate'
                  >
                    {formatDateLabel(row.renewalExpiry)}
                  </Text>
                </div>
                <div className='grid w-full'>
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
                    {row.status || '-'}
                  </Text>
                </div>
                <div className='grid w-full'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14'
                  >
                    Notes
                  </Text>
                  <Text
                    size='13'
                    lineHeight='21'
                    className='truncate'
                  >
                    {row.notes || '-'}
                  </Text>
                </div>
                <div className='grid w-full'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14'
                  >
                    Recurring
                  </Text>
                  <Text
                    size='13'
                    lineHeight='21'
                    className='truncate'
                  >
                    {row.recurring || '-'}
                  </Text>
                </div>
                <div className='grid w-full'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14'
                  >
                    Last Renewal Proposal
                  </Text>
                  <div className='min-h-[21px]'>
                    {row.lastRenewalProposalUrl ? (
                      <UrlTooltip
                        isRedirectContent
                        text={row.lastRenewalProposalLabel || 'Proposal'}
                        url={row.lastRenewalProposalUrl}
                      />
                    ) : (
                      <Text
                        size='13'
                        lineHeight='21'
                        className='truncate'
                      >
                        -
                      </Text>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </MobileDataTable>
      <div className='hidden w-full max-w-full lg:block'>
        <DataTable
          data={data}
          columns={columns}
          pageSize={20}
          className={cn('flex flex-col justify-between', {
            'min-h-[505px]': data.length > 10
          })}
          containerTableClassName='min-h-[473px]'
          tableClassName='w-full table-fixed'
          headerClassName='bg-transparent'
          headerRowClassName=''
          headerCellClassName='pt-3 pb-2.5 px-3'
          cellClassName='py-2.5 px-3 align-top whitespace-normal'
          headerTextClassName='text-primary-14 font-medium'
          rowClassName='hover:bg-transparent'
          enableRowHoverHighlight={false}
          enableSorting
          useColgroup
          enablePagination={data.length > 10}
          paginationClassName='py-2 px-2'
        />
      </div>
    </>
  );
};

export default SpendingsTable;
