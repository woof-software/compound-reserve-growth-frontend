import React from 'react';

import { MobileDataTable } from '@/components/MobileDataTable/MobileDataTable';
import { cn } from '@/shared/lib/classNames/classNames';
import { formatNumber, formatQuantity } from '@/shared/lib/utils/utils';
import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import Text from '@/shared/ui/Text/Text';

import { TextTooltip } from '../TextTooltip/TextTooltip';

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
    header: 'Initiative',
    size: 150,
    cell: ({ getValue }) => {
      const initiative = getValue() as string;
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
    header: 'Discipline'
  },
  {
    accessorKey: 'token',
    header: 'Token'
  },
  {
    accessorKey: 'amount',
    header: 'Amount (Qty)',
    align: 'center',
    cell: ({ getValue }) => formatQuantity(getValue() as number)
  },
  {
    accessorKey: 'value',
    header: 'Value ($)',
    align: 'right',
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
        <td className='text-primary-14 px-[5px] py-[13px] text-right text-[13px]'>
          {formatNumber(footerData.totalValue)}
        </td>
      </tr>
    </>
  );

  return (
    <>
      <MobileDataTable tableData={data}>
        {(dataRows) =>
          dataRows.map((row, index) => (
            <div
              key={index}
              className={cn(
                'border-secondary-23 grid grid-cols-3 gap-x-10 gap-y-3 border-b px-6 py-5 md:gap-x-[63px] md:px-10',
                {
                  'border-b-0': dataRows.length - 1 === index,
                  'border-t': index === 0
                }
              )}
            >
              <div className='grid w-full max-w-[73px]'>
                <Text
                  size='8'
                  lineHeight='18'
                  weight='500'
                  className='text-primary-14'
                >
                  Initiative
                </Text>
                <Text
                  size='11'
                  lineHeight='21'
                  className='truncate'
                >
                  {row.initiative}
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
                  Token
                </Text>
                <Text
                  size='11'
                  lineHeight='21'
                  className='truncate'
                >
                  {row.token}
                </Text>
              </div>
              <div className='grid w-full max-w-[73px]'>
                <Text
                  size='8'
                  lineHeight='18'
                  weight='500'
                  className='text-primary-14'
                >
                  Amount (Qty)
                </Text>
                <Text
                  size='11'
                  lineHeight='21'
                  className='truncate'
                >
                  {formatQuantity(row.amount)}
                </Text>
              </div>
              <div className='grid w-full max-w-[73px]'>
                <Text
                  size='8'
                  lineHeight='18'
                  weight='500'
                  className='text-primary-14'
                >
                  Value ($)
                </Text>
                <Text
                  size='11'
                  lineHeight='21'
                  className='truncate'
                >
                  {formatNumber(row.value)}
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
          pageSize={5}
          footerContent={footerContent}
          containerTableClassName='min-h-[345px]'
          className='flex min-h-[400px] flex-col justify-between'
          headerCellClassName='py-[13px] px-[5px]'
          cellClassName='py-3 px-[5px]'
          headerTextClassName='text-primary-14 font-medium'
          enableSorting
          enablePagination
          paginationClassName='py-[13px] px-[5px]'
          initialSort={{ id: 'value', desc: true }}
        />
      </div>
    </>
  );
};

export default CurrentInitiatives;
