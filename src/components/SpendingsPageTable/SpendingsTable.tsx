import React, { useMemo } from 'react';

import { MobileDataTable } from '@/components/MobileDataTable/MobileDataTable';
import { UrlTooltip } from '@/components/UrlTooltip/UrlTooltip';
import { cn } from '@/shared/lib/classNames/classNames';
import { Format } from '@/shared/lib/utils/numbersFormatter';
import { formatDateWithOrdinal } from '@/shared/lib/utils/utils';
import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import Text from '@/shared/ui/Text/Text';
import { TextTooltip } from '@/shared/ui/TextTooltip/TextTooltip';

import type { SpendingsRow } from '@/entities/Spendings/data/spendingsData';

interface SpendingsTableProps {
  data: SpendingsRow[];
  allocateHeader: string;
  totalAllocate: number;
}

const SpendingsTable: React.FC<SpendingsTableProps> = ({
  data,
  allocateHeader,
  totalAllocate
}) => {
  const columns: ExtendedColumnDef<SpendingsRow>[] = useMemo(
    () => [
      {
        accessorKey: 'number',
        header: 'Number',
        size: 70
      },
      {
        accessorKey: 'counterpartyService',
        header: 'Counterparty / Service',
        size: 220,
        cell: ({ getValue }) => {
          const value = (getValue() as string) || '-';
          return value.length > 28 ? (
            <TextTooltip
              text={value}
              triggerWidth={180}
              className={{ text: '!font-medium' }}
            />
          ) : (
            <Text
              size='13'
              weight='500'
            >
              {value}
            </Text>
          );
        }
      },
      {
        accessorKey: 'contractValue',
        header: 'Contract Value',
        align: 'right',
        cell: ({ getValue }) => {
          const value = getValue() as number | null;
          return value === null || value === undefined
            ? '-'
            : Format.price(value, 'standard');
        }
      },
      {
        accessorKey: 'contractStartDate',
        header: 'Contract Start Date',
        align: 'right',
        cell: ({ getValue }) => {
          const value = getValue() as string | null;
          return value ? formatDateWithOrdinal(value) : '-';
        }
      },
      {
        accessorKey: 'contractEndDate',
        header: 'Contract End Date',
        align: 'right',
        cell: ({ getValue }) => {
          const value = getValue() as string | null;
          return value ? formatDateWithOrdinal(value) : '-';
        }
      },
      {
        accessorKey: 'activeDaysInFY',
        header: 'Active Days in FY',
        align: 'center',
        cell: ({ getValue }) => {
          const value = getValue() as number | null;
          return value === null || value === undefined ? '-' : value;
        }
      },
      {
        accessorKey: 'allocate',
        header: allocateHeader,
        align: 'right',
        cell: ({ getValue }) => {
          const value = getValue() as number | null;
          return value === null || value === undefined
            ? '-'
            : Format.price(value, 'standard');
        }
      },
      {
        accessorKey: 'renewalExpiry',
        header: 'Renewal / Expiry',
        align: 'right',
        cell: ({ getValue }) => {
          const value = (getValue() as string) || '-';
          return formatDateWithOrdinal(value);
        }
      },
      {
        accessorKey: 'status',
        header: 'Status',
        align: 'center',
        cell: ({ getValue }) => (getValue() as string) || '-'
      },
      {
        accessorKey: 'notes',
        header: 'Notes',
        size: 220,
        cell: ({ getValue }) => {
          const value = (getValue() as string) || '-';
          return value.length > 28 ? (
            <TextTooltip
              text={value}
              triggerWidth={180}
            />
          ) : (
            <Text size='13'>{value}</Text>
          );
        }
      },
      {
        accessorKey: 'recurring',
        header: 'Recurring',
        align: 'center',
        cell: ({ getValue }) => (getValue() as string) || '-'
      },
      {
        accessorKey: 'lastRenewalProposalUrl',
        header: 'Last Renewal Proposal',
        size: 170,
        cell: ({ row }) => {
          if (!row.original.lastRenewalProposalUrl) return '-';
          return (
            <UrlTooltip
              isRedirectContent
              text={row.original.lastRenewalProposalLabel || 'Proposal'}
              url={row.original.lastRenewalProposalUrl}
            />
          );
        }
      }
    ],
    [allocateHeader]
  );

  const footerRow = (
    <tr>
      <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px] font-medium'>
        Sum
      </td>
      <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px]'></td>
      <td className='text-primary-14 px-[5px] py-[13px] text-right text-[13px]'></td>
      <td className='text-primary-14 px-[5px] py-[13px] text-right text-[13px]'></td>
      <td className='text-primary-14 px-[5px] py-[13px] text-right text-[13px]'></td>
      <td className='text-primary-14 px-[5px] py-[13px] text-center text-[13px]'></td>
      <td className='text-primary-14 px-[5px] py-[13px] text-right text-[13px] font-medium'>
        {Format.price(totalAllocate, 'standard')}
      </td>
      <td className='text-primary-14 px-[5px] py-[13px] text-right text-[13px]'></td>
      <td className='text-primary-14 px-[5px] py-[13px] text-center text-[13px]'></td>
      <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px]'></td>
      <td className='text-primary-14 px-[5px] py-[13px] text-center text-[13px]'></td>
      <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px]'></td>
    </tr>
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
                    className='truncate'
                  >
                    {row.contractValue === null || row.contractValue === undefined
                      ? '-'
                      : Format.price(row.contractValue, 'standard')}
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
                    {row.contractStartDate
                      ? formatDateWithOrdinal(row.contractStartDate)
                      : '-'}
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
                    {row.contractEndDate
                      ? formatDateWithOrdinal(row.contractEndDate)
                      : '-'}
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
                    className='truncate'
                  >
                    {row.allocate === null || row.allocate === undefined
                      ? '-'
                      : Format.price(row.allocate, 'standard')}
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
                    {formatDateWithOrdinal(row.renewalExpiry)}
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
            <div className='border-secondary-23 grid grid-cols-2 gap-x-10 gap-y-3 border-t p-5 md:gap-x-[63px] md:px-10'>
              <div className='grid min-h-[39px] w-full'>
                <Text
                  size='13'
                  lineHeight='18'
                  weight='500'
                  className='text-primary-14'
                >
                  Sum
                </Text>
              </div>
              <div className='grid w-full'>
                <Text
                  size='13'
                  lineHeight='18'
                  weight='500'
                  className='text-primary-14'
                >
                  {Format.price(totalAllocate, 'standard')}
                </Text>
              </div>
            </div>
          </>
        )}
      </MobileDataTable>
      <div className='hidden w-full max-w-full lg:block'>
        <DataTable
          data={data}
          columns={columns}
          pageSize={10}
          className={cn('flex flex-col justify-between', {
            'min-h-[505px]': data.length > 10
          })}
          containerTableClassName='min-h-[473px] overflow-x-auto'
          tableClassName='min-w-[1400px]'
          headerCellClassName='py-[13px] px-[5px]'
          cellClassName='py-3 px-[5px]'
          headerTextClassName='text-primary-14 font-medium'
          enablePagination={data.length > 10}
          paginationClassName='py-0 px-[5px]'
          footerContent={footerRow}
        />
      </div>
    </>
  );
};

export default SpendingsTable;
