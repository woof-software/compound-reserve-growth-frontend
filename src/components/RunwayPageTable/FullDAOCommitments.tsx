import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';

import { FULL_DAO_COMMITMENTS_DATA, FullDAOCommitmentProps } from './MOCK_DATA';

const columns: ExtendedColumnDef<FullDAOCommitmentProps>[] = [
  {
    accessorKey: 'recipient',
    header: 'Recipient'
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
    header: 'Amount'
  },
  {
    accessorKey: 'paymentType',
    header: 'Payment Type'
  },
  {
    accessorKey: 'dailyStreamRate',
    header: 'Daily Stream Rate'
  },
  {
    accessorKey: 'startDate',
    header: 'Start Date'
  },
  {
    accessorKey: 'streamEndDate',
    header: 'Stream End Date'
  }
];

const FullDAOCommitments = () => {
  return (
    <DataTable
      data={FULL_DAO_COMMITMENTS_DATA}
      columns={columns}
      pageSize={10}
      headerCellClassName='py-[13px] px-[5px]'
      cellClassName='py-3 px-[5px]'
      headerTextClassName='text-primary-14 font-medium'
    />
  );
};

export default FullDAOCommitments;
