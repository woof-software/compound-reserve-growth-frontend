import React from 'react';

import { MobileDataTable } from '@/components/MobileDataTable/MobileDataTable';
import type { SpendingsRow } from '@/entities/Spendings/data/spendingsData';
import { cn } from '@/shared/lib/classNames/classNames';
import { Format } from '@/shared/lib/utils/format';
import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import Text from '@/shared/ui/Text/Text';
import { TextTooltip } from '@/shared/ui/TextTooltip/TextTooltip';
import { Tooltip } from '@/shared/ui/Tooltip/Tooltip';

export interface SpendingsTableProps {
  data: SpendingsRow[];
  allocateHeader: string;
}

const createSpendingsColumns = (
  allocateHeader: string
): ExtendedColumnDef<SpendingsRow>[] => [
  {
    accessorKey: 'counterpartyService',
    header: 'Counterparty / Service',
    enableSorting: true,
    cell: ({ row }) => {
      const value = row.original.counterpartyService || '-';
      const notesValue = row.original.notes || '';
      return (
        <div className='flex min-w-0 flex-col'>
          {value.length > 28 ? (
            <TextTooltip
              text={value}
              className={{ text: '!font-normal' }}
            />
          ) : (
            <Text
              size='13'
              lineHeight='21'
            >
              {value}
            </Text>
          )}
          {notesValue ? (
            <Text
              size='11'
              lineHeight='18'
              weight='500'
              className='text-primary-14'
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
    enableSorting: true,
    cell: ({ row }) => {
      const compactValue = Format.price(
        row.original.contractValue || 0,
        'compact'
      );
      const fullValue = Format.price(
        row.original.contractValue || 0,
        'standard'
      );

      return (
        <div className='flex flex-col items-start'>
          <>
            <Tooltip content={fullValue}>
              <Text
                size='13'
                lineHeight='21'
              >
                {compactValue}
              </Text>
            </Tooltip>
          </>
          <Text
            size='11'
            lineHeight='18'
            weight='500'
            className='text-primary-14'
          >
            {Format.date(row.original.contractStartDate, 'short')} –{' '}
            {Format.date(row.original.contractEndDate, 'short')}
          </Text>
        </div>
      );
    }
  },
  {
    accessorKey: 'allocate',
    header: allocateHeader,
    enableSorting: true,
    cell: ({ getValue }) => {
      const value = getValue() as number | null;

      const compactValue = Format.price(value || 0, 'compact');
      const fullValue = Format.price(value || 0, 'standard');

      return (
        <Tooltip content={fullValue}>
          <Text
            size='13'
            lineHeight='21'
          >
            {compactValue}
          </Text>
        </Tooltip>
      );
    }
  },
  {
    accessorKey: 'renewalExpiry',
    header: 'Renewal / Status',
    enableSorting: true,
    cell: ({ row }) => (
      <div className='flex items-center gap-[6px]'>
        <Text
          size='13'
          lineHeight='21'
          className='min-w-[80px] tabular-nums'
        >
          {Format.date(row.original.renewalExpiry)}
        </Text>
        <span className='bg-secondary-27 border-border text-primary-14 flex h-[20px] items-center justify-center rounded-md border px-[12px] text-[11px] leading-[16px] font-medium'>
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
    cell: ({ row }) => (
      <div className='flex items-center gap-[6px]'>
        {row.original.lastRenewalProposalUrl ? (
          <a
            href={row.original.lastRenewalProposalUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='bg-secondary-27 border-border text-primary-14 flex h-[20px] items-center justify-center rounded-md border px-[12px] text-[11px] leading-[16px] font-medium'
          >
            {row.original.lastRenewalProposalLabel || 'Proposal'}
          </a>
        ) : null}
        <Text
          size='13'
          lineHeight='21'
          className='text-primary-14'
        >
          {row.original.activeDaysInFY ?? '-'}d
        </Text>
      </div>
    )
  }
];

const SpendingsTable: React.FC<SpendingsTableProps> = ({
  data,
  allocateHeader
}) => {
  const columns = createSpendingsColumns(allocateHeader);

  return (
    <>
      <MobileDataTable tableData={data}>
        {(dataRows) => (
          <>
            {dataRows.map((row) => (
              <div
                key={`${row.number}-${row.counterpartyService}`}
                className={cn(
                  'border-secondary-23 grid grid-cols-2 gap-x-10 gap-y-3 border-b p-5 md:grid-cols-3 md:gap-x-[63px] md:px-10'
                )}
              >
                <div className='col-span-2 grid w-full md:col-span-1'>
                  <Text
                    size='11'
                    weight='500'
                    className='text-primary-14'
                  >
                    Counterparty / Service
                  </Text>
                  <div className='mt-2.5'>
                    <Text
                      size='13'
                      lineHeight='21'
                      className='truncate'
                    >
                      {row.counterpartyService || '-'}
                    </Text>
                    <Text
                      size='11'
                      weight='500'
                      lineHeight='18'
                      className='text-primary-14 truncate'
                    >
                      {row.notes || '-'}
                    </Text>
                  </div>
                </div>
                <div className='grid w-full'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14'
                  >
                    Contract
                  </Text>
                  <div className='mt-2.5'>
                    <Text
                      size='13'
                      lineHeight='21'
                      className='truncate tabular-nums'
                    >
                      {Format.price(row.contractValue || 0, 'compact')}
                    </Text>
                    <Text
                      size='11'
                      weight='500'
                      className='text-primary-14 max-w-full truncate leading-4 whitespace-nowrap'
                    >
                      {Format.date(row.contractStartDate, 'short')} –{' '}
                      {Format.date(row.contractEndDate, 'short')}
                    </Text>
                  </div>
                </div>
                <div className='grid w-full'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14'
                  >
                    {allocateHeader || 'Allocate'}
                  </Text>
                  <Text
                    size='13'
                    lineHeight='21'
                    className='mt-2.5 truncate tabular-nums'
                  >
                    {Format.price(row.allocate || 0, 'compact')}
                  </Text>
                </div>
                <div className='grid w-full'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14'
                  >
                    Renewal / Status
                  </Text>
                  <div className='mt-2.5 flex items-center gap-1.5'>
                    <Text
                      size='13'
                      lineHeight='21'
                      className='truncate'
                    >
                      {Format.date(row.renewalExpiry)}
                    </Text>
                    <span className='bg-secondary-27 text-primary-14 flex items-center justify-center rounded-md px-2 py-0.5 text-[11px] leading-4 font-medium'>
                      {row.status || '-'}
                    </span>
                  </div>
                </div>
                <div className='grid w-full'>
                  <Text
                    size='11'
                    lineHeight='18'
                    weight='500'
                    className='text-primary-14'
                  >
                    Details
                  </Text>
                  <div className='mt-2.5 flex min-h-[22px] items-center gap-2.5'>
                    {row.lastRenewalProposalUrl && (
                      <a
                        href={row.lastRenewalProposalUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='bg-secondary-27 text-primary-14 inline-flex shrink-0 items-center justify-center rounded-md px-2 py-0.5 text-[10px] leading-4 font-medium whitespace-nowrap'
                      >
                        {row.lastRenewalProposalLabel || 'Proposal'}
                      </a>
                    )}
                    <Text
                      size='13'
                      weight='500'
                      className='text-primary-14 truncate'
                    >
                      {row.activeDaysInFY ?? '-'}d
                    </Text>
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
          tableClassName='w-full'
          headerClassName='bg-transparent'
          headerCellClassName='pt-3 pb-2.5 pr-3 pl-0'
          cellClassName='py-2.5 pr-3 pl-0 align-top whitespace-normal'
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
