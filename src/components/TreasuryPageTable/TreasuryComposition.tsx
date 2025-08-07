import { useMemo } from 'react';

import { formatPrice } from '@/shared/lib/utils/utils';
import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';

export interface TreasuryCompositionType {
  id: number;
  icon: string;
  name: string;
  balance: number;
  symbol?: string;
}

interface TreasuryCompositionProps {
  tableData: TreasuryCompositionType[];
  totalBalance: number;
  activeFilter: 'Chain' | 'Asset Type' | 'Market';
}

const filterConfig = {
  Market: {
    folder: 'collaterals' as const,
    getIconName: (row: TreasuryCompositionType) =>
      row.symbol || 'not-found-icon'
  },
  Chain: {
    folder: 'network' as const,
    getIconName: (row: TreasuryCompositionType) =>
      (row.icon || 'not-found-icon').toLowerCase()
  },
  'Asset Type': {
    folder: 'token' as const,
    getIconName: (row: TreasuryCompositionType) =>
      (row.icon || 'not-found-icon').toLowerCase()
  }
};

const TreasuryComposition = ({
  tableData,
  totalBalance,
  activeFilter
}: TreasuryCompositionProps) => {
  const columns = useMemo<ExtendedColumnDef<TreasuryCompositionType>[]>(() => {
    const config = filterConfig[activeFilter];

    return [
      {
        accessorKey: 'name',
        header: 'Asset',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Icon
              name={config.getIconName(row.original)}
              className='h-6 w-6'
              folder={config.folder}
            />
            <Text size='13'>{row.original.name}</Text>
          </div>
        )
      },
      {
        accessorKey: 'balance',
        header: 'Total Balance USD',
        align: 'right',
        cell: ({ row }) => (
          <Text
            size='13'
            weight='400'
            className='text-right'
          >
            {formatPrice(row.original.balance, 1)}
          </Text>
        )
      }
    ];
  }, [activeFilter]);

  return (
    <div className='max-h-[400px] w-full max-w-1/2 overflow-y-auto lg:max-w-[522px]'>
      <DataTable
        data={tableData}
        columns={columns}
        pageSize={10}
        enableSorting={true}
        headerCellClassName='py-[13px] px-[5px]'
        cellClassName='py-3 px-[5px]'
        headerTextClassName='text-primary-14 font-medium'
      />
      <div className='flex items-center justify-between px-[5px] py-3'>
        <Text
          size='11'
          className='text-primary-14'
        >
          Total Balance
        </Text>
        <Text
          size='11'
          className='text-primary-14'
        >
          {formatPrice(totalBalance, 1)}
        </Text>
      </div>
    </div>
  );
};

export default TreasuryComposition;
