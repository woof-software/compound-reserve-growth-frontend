import { useMemo, useState } from 'react';

import SpendingsTable from '@/components/SpendingsPageTable/SpendingsTable';
import {
  spendingsByYear,
  type SpendingsRow,
  SpendingsYear
} from '@/entities/Spendings/data/spendingsData';
import { useModal } from '@/shared/hooks/useModal';
import {
  SortAccessor,
  SortAdapter,
  useSorting
} from '@/shared/hooks/useSorting';
import { Format } from '@/shared/lib/utils/format';
import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import Icon from '@/shared/ui/Icon/Icon';
import SortDrawer from '@/shared/ui/SortDrawer/SortDrawer';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
import Text from '@/shared/ui/Text/Text';

export const YEAR_TABS: SpendingsYear[] = ['2024', '2025'];

export const spendingsSortColumns: SortAccessor<SpendingsRow>[] = [
  { accessorKey: 'counterpartyService', header: 'Counterparty / Service' },
  { accessorKey: 'renewalExpiry', header: 'Renewal / Status' },
  { accessorKey: 'activeDaysInFY', header: 'Details' }
];

const SpendingsLedger = () => {
  const [activeYear, setActiveYear] = useState<SpendingsYear>('2024');

  const { sortDirection, sortKey, onKeySelect, onTypeSelect, applySorting } =
    useSorting<SpendingsRow>('asc', null);

  const sortType: SortAdapter<SpendingsRow> = {
    key: sortKey,
    type: sortDirection
  };

  const {
    isOpen: isSortOpen,
    onOpenModal: onSortOpen,
    onCloseModal: onSortClose
  } = useModal();

  const tableData = useMemo(
    () => applySorting(spendingsByYear[activeYear] || []),
    [activeYear]
  );

  const totalAllocate = useMemo(() => {
    return tableData.reduce((acc, row) => acc + (row.allocate ?? 0), 0);
  }, [tableData]);

  return (
    <Card
      title='Spending Ledger'
      id='spendings-ledger'
      className={{
        header: 'px-5 md:px-10',
        content: 'p-0 lg:px-10 lg:pt-0 lg:pb-[40px]',
        container: 'border-background border'
      }}
    >
      <div className='flex flex-col'>
        <div className='mb-2 flex flex-wrap items-center justify-between gap-3 px-5 py-3 md:mb-3 md:px-10 lg:px-0'>
          <TabsGroup
            tabs={YEAR_TABS}
            value={activeYear}
            onTabChange={setActiveYear}
          />
          <div className='flex items-center gap-[20px]'>
            <Text
              size='13'
              weight='500'
              className='text-primary-11 tabular-nums'
            >
              Sum: {Format.price(totalAllocate, 'compact')}
            </Text>
            <Button
              onClick={onSortOpen}
              className='bg-secondary-27 text-gray-11 shadow-13 h-8 w-[32px] gap-1.5 rounded-lg md:flex md:w-[110px] lg:hidden'
            >
              <Icon
                name='sort-icon'
                className='h-[14px] w-[14px]'
              />
              <span className='hidden text-[11px] leading-4 font-semibold md:flex'>
                Sort
              </span>
            </Button>
          </div>
        </div>
        <SpendingsTable
          data={tableData}
          allocateHeader={`FY${activeYear} Allocate`}
        />
      </div>
      <SortDrawer
        isOpen={isSortOpen}
        onClose={onSortClose}
        sortType={sortType}
        columns={spendingsSortColumns}
        onTypeSelect={onTypeSelect}
        onKeySelect={onKeySelect}
      />
    </Card>
  );
};

export default SpendingsLedger;
