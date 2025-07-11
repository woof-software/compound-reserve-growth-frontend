import { formatPrice } from '@/shared/lib/utils/utils';
import DataTable, { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';

import { Tooltip } from '../Tooltip/Tooltip';

const treasuryColumns: ExtendedColumnDef<TreasuryBalanceByNetworkType>[] = [
  {
    accessorKey: 'symbol',
    header: 'Symbol',
    enableSorting: true,
    cell: ({ row }) => (
      <div className='flex items-center gap-3'>
        <Icon
          name='not-found-icon'
          className='h-5 w-5'
        />
        <Text size='13'>{row.original.symbol}</Text>
      </div>
    )
  },
  {
    accessorKey: 'qty',
    header: 'QTY',
    enableSorting: true,
    cell: ({ row }) => <Text size='13'>{formatPrice(row.original.qty, 1)}</Text>
  },
  {
    accessorKey: 'value',
    header: 'Value',
    enableSorting: true,
    cell: ({ row }) => (
      <Text size='13'>{formatPrice(row.original.value, 1)}</Text>
    )
  },
  {
    accessorKey: 'market',
    header: 'Market',
    enableSorting: true,
    cell: ({ row }) => (
      <Text size='13'>
        {row.original.market === 'no market' ? ' - ' : row.original.market}
      </Text>
    )
  },
  {
    accessorKey: 'source',
    header: 'Source',
    enableSorting: true,
    size: 120,
    cell: ({ row }) => {
      const sourceText = row.original.source;
      const TRUNCATE_LIMIT = 20;

      const content = (
        <div className='max-w-[120px] overflow-hidden'>
          <Text
            size='13'
            className='truncate whitespace-nowrap'
          >
            {sourceText}
          </Text>
        </div>
      );

      if (sourceText.length > TRUNCATE_LIMIT) {
        return <Tooltip content={sourceText}>{content}</Tooltip>;
      }

      return content;
    }
  }
];

export type TreasuryBalanceByNetworkType = {
  symbol: string;
  qty: number;
  value: number;
  source: string;
  market: string;
};

interface TreasuryBalanceByNetworkProps {
  tableData: TreasuryBalanceByNetworkType[];
}

const TreasuryBalanceByNetwork = ({
  tableData
}: TreasuryBalanceByNetworkProps) => {
  return (
    <div className='w-full max-w-[522px]'>
      <DataTable
        data={tableData}
        columns={treasuryColumns}
        enableSorting
        enablePagination
        pageSize={10}
        headerCellClassName='py-[13px] px-[5px]'
        cellClassName='py-3 px-[5px]'
        headerTextClassName='text-primary-14 font-medium'
        paginationClassName='py-[13px] px-[5px]'
      />
    </div>
  );
};

export default TreasuryBalanceByNetwork;
