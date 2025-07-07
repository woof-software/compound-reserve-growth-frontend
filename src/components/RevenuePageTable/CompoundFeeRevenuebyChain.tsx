import React from 'react';

import { formatNumber } from '@/shared/lib/utils/utils';
import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';

export interface ProcessedRevenueData {
  chain: string;
  [key: string]: string | number;
}

interface CompoundFeeRevenuebyChainProps {
  data: ProcessedRevenueData[];
  columns: ExtendedColumnDef<ProcessedRevenueData>[];
  totals: { [key: string]: number };
}

const CompoundFeeRevenuebyChain = ({
  data,
  columns,
  totals
}: CompoundFeeRevenuebyChainProps) => {
  const footerRow = (
    <tr key='footer-total-row'>
      <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px] font-medium'>
        Total
      </td>
      {columns.slice(1).map((col) => {
        const columnKey =
          'accessorKey' in col ? String(col.accessorKey) : col.id;
        if (!columnKey) {
          return null;
        }

        return (
          <td
            key={columnKey}
            className='text-primary-14 px-[5px] py-[13px] text-left text-[13px]'
          >
            {formatNumber(totals[columnKey])}
          </td>
        );
      })}
    </tr>
  );

  return (
    <DataTable
      data={data}
      columns={columns}
      pageSize={10}
      footerContent={columns.length > 0 ? footerRow : null}
      headerCellClassName='py-[13px] px-[5px]'
      cellClassName='py-3 px-[5px]'
      headerTextClassName='text-primary-14 font-medium'
    />
  );
};

export default CompoundFeeRevenuebyChain;
