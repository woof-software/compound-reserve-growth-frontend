import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import Icon from '@/shared/ui/Icon/Icon';

import { REVENUE_OVERVIEW_USD, RevenueOverviewUSDProps } from './MOCK_DATA';

const columns: ExtendedColumnDef<RevenueOverviewUSDProps>[] = [
  {
    accessorKey: 'chain',
    header: 'Chain',
    cell: ({ getValue }) => {
      const chainName = getValue() as string;
      return (
        <div className='flex items-center gap-2'>
          <Icon
            name='not-found-icon'
            className='h-5 w-5'
          />
          <span>{chainName}</span>
        </div>
      );
    }
  },
  {
    accessorKey: 'rolling7D',
    header: 'Rolling 7D'
  },
  {
    accessorKey: 'rolling30D',
    header: 'Rolling 30D'
  },
  {
    accessorKey: 'rolling90D',
    header: 'Rolling 90D'
  },
  {
    accessorKey: 'rolling180D',
    header: 'Rolling 180D'
  },
  {
    accessorKey: 'rolling365D',
    header: 'Rolling 365D'
  }
];

const RevenueOverviewUSD = () => {
  const footerRow = (
    <tr>
      <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px]'>
        Total
      </td>
      <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px]'>
        123000
      </td>
      <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px]'>
        123000
      </td>
      <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px]'>
        123000
      </td>
      <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px]'>
        123000
      </td>
      <td className='text-primary-14 px-[5px] py-[13px] text-left text-[13px]'>
        123000
      </td>
    </tr>
  );

  return (
    <DataTable
      className='max-w-[646px]'
      enableSorting={true}
      data={REVENUE_OVERVIEW_USD}
      columns={columns}
      pageSize={10}
      footerContent={footerRow}
      headerCellClassName='py-[13px] px-[5px]'
      cellClassName='py-3 px-[5px]'
      headerTextClassName='text-primary-14 font-medium'
    />
  );
};

export default RevenueOverviewUSD;
