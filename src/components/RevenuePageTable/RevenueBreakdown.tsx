import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';

import { REVENUE_BREAKDOWN_DATA, RevenueBreakdownProps } from './MOCK_DATA';

const columns: ExtendedColumnDef<RevenueBreakdownProps>[] = [
  {
    accessorKey: 'chain',
    header: 'Chain'
  },
  {
    accessorKey: 'instance',
    header: 'Instance'
  },
  {
    accessorKey: 'feeType',
    header: 'Fee Type'
  },
  {
    accessorKey: 'reserveAsset',
    header: 'Reserve Asset'
  },
  {
    accessorKey: 'q3_2024',
    header: 'Q3 2024'
  },
  {
    accessorKey: 'q4_2024',
    header: 'Q4 2024'
  },
  {
    accessorKey: 'q1_2025',
    header: 'Q1 2025'
  },
  {
    accessorKey: 'q2_2025',
    header: 'Q2 2025'
  }
];

const RevenueBreakdown = () => {
  return (
    <DataTable
      data={REVENUE_BREAKDOWN_DATA}
      columns={columns}
      pageSize={10}
      headerCellClassName='py-[13px] px-[5px]'
      cellClassName='py-3 px-[5px]'
      headerTextClassName='text-primary-14 font-medium'
    />
  );
};

export default RevenueBreakdown;
