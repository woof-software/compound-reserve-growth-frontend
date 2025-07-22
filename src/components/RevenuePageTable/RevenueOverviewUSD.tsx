import React, { FC } from 'react';

import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';

export interface TableRowData {
  chain: string;
  [key: string]: string | number;
}

interface RevenueOverviewUSDProps {
  data: TableRowData[];
  columns: ExtendedColumnDef<TableRowData>[];
  footerContent: React.ReactNode;
}

const RevenueOverviewUSD: FC<RevenueOverviewUSDProps> = ({
  data,
  columns,
  footerContent
}) => {
  return (
    <DataTable
      className='flex min-h-[565px] max-w-[800px] flex-col justify-between'
      enableSorting={true}
      data={data}
      columns={columns}
      pageSize={10}
      footerContent={footerContent}
      headerCellClassName='py-[13px] px-[5px]'
      cellClassName='py-3 px-[5px]'
      headerTextClassName='text-primary-14 font-medium'
    />
  );
};

export default RevenueOverviewUSD;
