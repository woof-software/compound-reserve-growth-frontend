import { useMemo } from 'react';

import { formatNumber } from '@/shared/lib/utils/utils';
import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';

export interface FormattedRevenueData {
  chain: string;
  market: string;
  source: string;
  reserveAsset: string;
  [key: string]: string | number;
}

interface RevenueBreakdownProps {
  data: FormattedRevenueData[];
  columns: ExtendedColumnDef<FormattedRevenueData>[];
}

const RevenueBreakdown = ({ data, columns }: RevenueBreakdownProps) => {
  const totals = useMemo(() => {
    const columnTotals: Record<string, number> = {};

    columns.forEach((col) => {
      const key = 'accessorKey' in col ? String(col.accessorKey) : col.id;
      if (key && key.startsWith('q')) {
        columnTotals[key] = 0;
      }
    });

    data.forEach((row) => {
      for (const key in columnTotals) {
        const value = Number(row[key]);
        if (!isNaN(value)) {
          columnTotals[key] += value;
        }
      }
    });

    return columnTotals;
  }, [data, columns]);

  const footerRow = (
    <tr key='footer-total-row'>
      {columns.map((col, index) => {
        const columnKey =
          'accessorKey' in col ? String(col.accessorKey) : col.id;

        if (index === 0) {
          return (
            <td
              key='footer-total-label'
              className='text-primary-14 px-[5px] py-[13px] text-left text-[13px] font-medium'
            >
              Total
            </td>
          );
        }

        if (!columnKey || !columnKey.startsWith('q')) {
          return <td key={columnKey || index}></td>;
        }

        const totalValue = totals[columnKey];
        return (
          <td
            key={columnKey}
            className='text-primary-14 px-[5px] py-[13px] text-left text-[13px]'
          >
            {totalValue === 0 ? '-' : formatNumber(totalValue)}
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
      headerCellClassName='py-[13px] px-[5px]'
      cellClassName='py-3 px-[5px]'
      headerTextClassName='text-primary-14 font-medium'
      footerContent={columns.length > 0 && data.length > 0 ? footerRow : null}
    />
  );
};

export default RevenueBreakdown;
